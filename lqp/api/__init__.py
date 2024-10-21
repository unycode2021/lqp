import re
import json
import html
import unicodedata
import frappe
import random
import string
import requests
from frappe import _
from frappe.utils import get_url, now_datetime, get_time
from frappe import sendmail
from frappe.rate_limiter import rate_limit
from frappe.website.utils import (
    clear_cache,
    find_first_image,
    get_comment_list,
)


URLS_COMMENT_PATTERN = re.compile(
    r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+",
    re.IGNORECASE,
)
EMAIL_PATTERN = re.compile(
    r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)", re.IGNORECASE
)
frappe.utils.logger.set_log_level("DEBUG")
logger = frappe.logger("lqp", allow_site=False, file_count=10)


@frappe.whitelist()
def logout():
    frappe.api.v2.logout()
    frappe.clear_cache()
    return

@frappe.whitelist(allow_guest=True)
def check_auth():
    user = frappe._dict({"username":"Guest"})
    auth = False
    if frappe.session.user != "Guest":
        user = frappe.get_doc("User", frappe.session.user)
        auth = True
    else:
        guest_dreams = my_dreams()
        if len(guest_dreams) > 0:
            user.username = guest_dreams[0]['dreamer']
            
    return {"dreamer":user.username,"isAuthenticated": auth}


@frappe.whitelist()
def get_schedules():
       try:
            schedules = []
            schedules_ = frappe.get_all("LQP Schedule", filters={"owner": frappe.session.user})
            for schedule in schedules_:
                schedules.append(frappe.get_doc("LQP Schedule", schedule.name).as_dict())
            return schedules
       except Exception as e:
           logger.error(f"Error fetching schedules: {e}")
           return []

@frappe.whitelist()
def save_schedule(schedule):
    user_schedules = get_schedules()
    schedule_limit = frappe.db.get_single_value("LQP Settings", "lqp_schedule_limit")
    if len(user_schedules) >= schedule_limit:
            return "You have reached the maximum number of schedules allowed."
    try:
        new_schedule = frappe.get_doc(
            {
                "doctype": "LQP Schedule",
                "preset_name": schedule.get("presetName"),
                "preset": schedule.get("preset"),
                "date": schedule.get("date").split("T")[0],
                "frequency": schedule.get("frequency"),
                "time_slots": ",".join(schedule.get("timeSlots", [])),
                "emails": ",".join(schedule.get("emails", [])),
            }
        )
        new_schedule.insert()
        frappe.db.commit()
        return "success"
    except Exception as e:
        logger.error(f"Error saving schedule: {e}")
        return"Failed to save schedule"

@frappe.whitelist(allow_guest=True)
@rate_limit(limit=3, seconds=60 * 60 * 24)
def signup(username):
    try:
        # Generate a random password
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        user_ = frappe.db.get("User", {"email": username})
        if not user_:
            user = frappe.get_doc({
                   "doctype": "User",
                   "email": username,
                   "first_name": username.split("@")[0],
                   "new_password": password,
                   "enabled": 1,
                   "send_welcome_email": 0,
                   "user_type": "Website User",
               })
            user.insert(ignore_permissions=True)
        else:
            user = frappe.get_doc("User", user_.name)
            user.new_password = password
            user.enabled = 1
            user.save(ignore_permissions=True)
        # Send confirmation email with the generated password
        subject = "Your Dream Reader and LQP Account Details"
        message = f"Full access to DR and LQP has been granted. Your password is: {password}"
        company_logo = frappe.get_website_settings("app_logo") or frappe.get_hooks("app_logo_url")[-1]
        site_url = get_url()
        sendmail(
            recipients=[username],
            subject=subject,
            message=message,
            template="account_creation",
            args={"message": message,"logo":company_logo,"site_url":site_url},
        )

        frappe.db.commit()
        return "success"
    except Exception as e:
        err = frappe.get_traceback().replace("<", "&lt;").replace(">", "&gt;")
        logger.error(f"Signup error: {err}")
        return "failure"


@frappe.whitelist(allow_guest=True)
def adjust_dreamer_name(dreamer):
    if frappe.session.user != "Guest":
        user = frappe.get_doc("User", frappe.session.user)
        return user.username
    
    existing_dreamers = frappe.get_all("LQP Dream", fields=["dreamer"], distinct=True)     
    dream_found = [d.dreamer for d in existing_dreamers if d.dreamer == dreamer]
    if len(dream_found) > 0:
        # Append random characters to make the dreamer unique
        dreamer = f"{dreamer}{''.join(random.choices(string.ascii_lowercase + string.digits, k=6))}"

    return dreamer


@frappe.whitelist(allow_guest=True)
@rate_limit(limit=4, seconds=60 * 60 * 24)
def read_dream(dream, dreamer, shareDream, shareInterpretation):
    # get form post data from request
    dream_description = dream
    dream_description = html.unescape(dream_description)
    dream_description = re.sub('<[^<]+?>', '', dream_description)
    res = {}

    if len(dreamer) < 3:
        return {"error": "Dreamer name should be at least 3 characters long"}
    # Unicode normalization
    dream_description = unicodedata.normalize('NFKC', dream_description)
    if any(not c.isprintable() for c in dream_description):
        return {"error": "Dream contains invalid characters"}

    if URLS_COMMENT_PATTERN.search(dream_description) or EMAIL_PATTERN.search(dream_description):
        return {"error": "Dreams cannot have links or email addresses"}

    word_count = len(dream_description.split())
    if word_count < 40:
        return {
            "error": f"Dream description should be between 40 and 200 words. Current word count: {word_count}"
        }
    if word_count > 200:
        dream_description = " ".join(dream_description.split()[:200])

    dream_prefix = dream_description[:40]
    ip_address = frappe.local.request_ip
    existing_dream = frappe.get_all(
        "LQP Dream",
        filters={"dream": ("like", f"{dream_prefix}%")},
        fields=["name", "owner", "ip_address"],
    )
    user = frappe.session.user

    dream_doc = None
    update_dream = False
    share_dream = shareDream
    share_interpretation = shareInterpretation
    
    if user == "Guest":
        dreamer = adjust_dreamer_name(dreamer)

    
    dreamer_ = frappe._dict({"username": dreamer})

    if user != "Guest":
        dreamer_ = frappe.get_doc("User", user)

    if len(existing_dream) > 0:
        dream_doc = frappe.get_doc("LQP Dream", existing_dream[0].name)
        if dream_doc.owner == user or dream_doc.ip_address == ip_address:
            update_dream = True
            res = {"interpretation": dream_doc.interpretation}
    
    if not update_dream:
        interpretation = local_dream_interpreter(dream_description)
        res = {"interpretation": interpretation}
   
        try:
            # get api_key and url from settings for dream reader
            api_key = frappe.db.get_single_value("LQP Settings", "dream_reader_api_key")
            api_url = frappe.db.get_single_value("LQP Settings", "dream_reader_api_url")

            headers = {
                     "Content-Type": "application/json",
                     "Authorization": f"Bearer {api_key}",
                     }

            data = {
                                   "model": "gpt-4o-mini",  # or gpt-3.5-turbo
                                   "messages": [
                                          {"role": "system", "content": "You are a dream interpreter."},
                                          {"role": "user", "content": f"Interpret this dream: '{dream_description}' and keep the response within 400 words."},
                                   ],
                                   "max_tokens": 500,
                                   "temperature": 0.7
                            }

            # Send the POST request to the OpenAI API
            response = requests.post(api_url, headers=headers, json=data)

            # Check if the request was successful
            if response.status_code == 200:
                result = response.json()
                logger.debug(f"Response: {result}")
                res = {"interpretation": result['choices'][0]['message']['content']}
            else:
                logger.error(f"Error: {response.status_code} - {response.text}")

        except Exception as e:
            error = frappe.get_traceback().replace("<", "&lt;").replace(">", "&gt;")
            logger.error(f"Error: {error}")

    if update_dream:
        dream_doc.dream = dream_description
        dream_doc.share_dream = share_dream
        dream_doc.share_interpration = share_interpretation
        dream_doc.save(ignore_permissions=True)
    else:
        dream_doc = frappe.get_doc(
            {
                "doctype": "LQP Dream",
                "dream": dream_description,
                "dreamer": dreamer_.username,
                "interpretation": res["interpretation"],
                "ip_address": ip_address,
                "share_dream": share_dream,
                "share_interpretation": share_interpretation,
            }
        )
        dream_doc.insert(ignore_permissions=True)
    frappe.db.commit()
    res.update({"dream": dream_doc.name})
    return res


@frappe.whitelist(allow_guest=True)
def local_dream_interpreter(dream):
    keywords = dream.lower().split()
    interpretations = {
        "water": "flows with the essence of emotions and the depths of your unconscious mind. It whispers of purification, healing, and the need for emotional rejuvenation.",
        "flying": "soars on the wings of freedom, transcending earthly obstacles. It speaks of your spirit's yearning for independence and ascension above life's challenges.",
        "falling": "echoes the soul's fear of losing control. It may reveal hidden insecurities or anxieties that seek acknowledgment and healing.",
        "teeth": "mirror the strength of your inner confidence and personal power. Their loss or gain reflects shifts in your self-image and life's transitions.",
        "chase": "reveals the shadow aspects you may be avoiding. It calls you to face unresolved anxieties and find the courage to confront what you've been running from.",
        "fire": "burns with the intensity of transformation and passion. It illuminates the path of change and warns of emotions that may consume if left unchecked.",
        "snake": "coils with the wisdom of hidden knowledge and personal growth. It may represent a challenging person or situation that holds the key to your evolution.",
        "house": "stands as a sacred temple of your inner self. Each room unfolds a chapter of your psyche, inviting deep self-exploration and understanding.",
        "death": "whispers not of physical end, but of profound transformation. It heralds the closing of one life chapter and the sacred beginning of another.",
        "money": "reflects the currency of your self-worth and personal energy. Its ebb and flow mirror your sense of empowerment and life's abundance.",
        "stars": "twinkle with divine guidance and cosmic connection. They remind you of your place in the vast universe and the infinite possibilities that await.",
        "ocean": "surges with the power of the collective unconscious. It invites you to dive deep into the mysteries of your soul and emerge renewed.",
        "mountain": "stands tall as a symbol of your aspirations and the challenges you must overcome. It encourages perseverance and the reward of reaching new heights.",
        "bridge": "connects different aspects of your life or psyche. Crossing it may signify a transition or the need to reconcile opposing forces within yourself.",
        "door": "opens to new opportunities and closed chapters. It asks you to consider what you're ready to leave behind and what new experiences you're willing to embrace.",
        "bird": "carries messages from the spiritual realm. Its presence may indicate freedom, perspective, or the need to view your situation from a higher vantage point.",
        "tree": "roots you in the wisdom of nature and personal growth. It reflects your connection to your ancestors and the branching possibilities of your future.",
        "mirror": "reflects the truth of your inner self. It challenges you to see beyond surface appearances and confront your authentic being.",
        "key": "unlocks hidden potential and secret knowledge. It suggests that you possess the power to access new realms of understanding and opportunity.",
        "clock": "ticks with the rhythm of life's cycles. It may indicate a significant timing in your journey or the need to re-evaluate how you spend your precious time."
    }

    matched_keywords = [word for word in keywords if word in interpretations]
    
    if matched_keywords:
        interpretation = "Your dream contains several interesting elements that are often associated with certain ideas in dream interpretation:\n\n"
        for word in matched_keywords:
            interpretation += f"- {word.capitalize()}: {interpretations[word]}\n\n"
        
        interpretation += "Considering these elements together:\n\n"
        
        if len(matched_keywords) > 1:
            interpretation += "Your dream seems to touch on multiple aspects of your life or psyche. These symbols might be reflecting various thoughts, emotions, or experiences you're currently processing. Consider how these elements might relate to your current life situations or inner feelings.\n\n"
        else:
            interpretation += f"The presence of '{matched_keywords[0]}' in your dream could be significant. It might be worthwhile to reflect on how this symbol and its potential meanings resonate with your current experiences or emotions.\n\n"
        
        interpretation += "Remember, while these interpretations offer food for thought, the most meaningful interpretation will come from your own reflections and insights about your dream."
    else:
        interpretation = f"Your dream about '{dream}' contains unique elements that don't have common symbolic interpretations. However, this doesn't make your dream any less meaningful or significant.\n\n"
        interpretation += "To explore its potential meaning, you might consider:\n\n"
        interpretation += "1. What feelings did this dream evoke in you?\n"
        interpretation += "2. Do any elements of the dream remind you of current situations or thoughts in your waking life?\n"
        interpretation += "3. If this dream were trying to tell you something, what do you think it might be?\n\n"
        interpretation += "Ultimately, you are the best interpreter of your own dreams. Trust your intuition and personal associations to uncover what this dream might mean for you."

    return interpretation


@frappe.whitelist(allow_guest=True)
def stream_dreams(page=0):
    try:
        page = int(page)
        dreams_per_page = 10
        offset = page * dreams_per_page

        dreams = frappe.get_all(
            "LQP Dream",
            fields=["name", "dream as dreamContent", "interpretation", "creation as createdAt", "dreamer","share_interpretation"],
            filters={"share_dream": 1,"active":1},
            order_by="creation desc",
            start=offset,
            limit=dreams_per_page
        )

        for dream in dreams:
            dream['dreamerAvatar'] = frappe.get_value("User", dream['name'], "user_image") or "/assets/lqp/img/avatar.png"
            dream['isLiked'], dream["likes"] = get_likes("LQP Dream",dream['name'])
            dream["comments"] = get_comment_list("LQP Dream", dream['name'])
            if not dream['share_interpretation']:
                dream['interpretation'] = "Any thoughts on What this could mean?"
                
        next_cursor = page + 1 if len(dreams) == dreams_per_page else None

        return {
            "dreams": dreams,
            "nextCursor": next_cursor
        }
    except Exception as e:
        logger.error(f"Error fetching dreams: {e}")
        return {"error": str(e)}

@frappe.whitelist(allow_guest=True)
def my_dreams():
    user = frappe.session.user
    filters = {"active": 1}

    if user == "Guest":
        filters["ip_address"] = frappe.local.request_ip
    else:
        filters["owner"] = user

    dreams = frappe.get_all(
        "LQP Dream",
        fields=["name", "dream as dreamContent","dreamer", "interpretation", "creation as createdAt"],
        filters=filters,
        order_by="creation desc"
    )

    for dream in dreams:
        dream['isLiked'], dream["likes"] = get_likes("LQP Dream", dream['name'])
        dream["comments"] = get_comment_list("LQP Dream", dream['name'])

    return dreams

@frappe.whitelist(allow_guest=True)
def delete_dream(dream):
    user = frappe.session.user
    if user == "Guest":
        return {"error": "Please login to delete a dream."}

    dream_ = frappe.get_value("LQP Dream", dream)
    if dream_:
        d_dream = frappe.get_doc("LQP Dream", dream)
        d_dream.active = 0
        d_dream.save()
        return {"success": "Dream deleted successfully."}
    else:
        return {"error": "Dream not found or you don't have permission to delete it."}


def get_likes(doctype, name):
    user = frappe.session.user
    filters = {
        "comment_type": "Like",
        "reference_doctype": doctype,
        "reference_name": name,
    }

    like_count = frappe.db.count("Comment", filters) or 0

    filters["comment_email"] = user

    if user == "Guest":
        filters["ip_address"] = frappe.local.request_ip

    like = frappe.db.count("Comment", filters) or 0
    return like, like_count


@frappe.whitelist(allow_guest=True)
@rate_limit(key="reference_name", limit=3, seconds=60 * 60)
def like(reference_name, like, reference_doctype="LQP Dream", route=""):
    like = frappe.parse_json(like)
    ref_doc = frappe.get_doc(reference_doctype, reference_name)

    if like:
        liked = add_like(reference_doctype, reference_name)
    else:
        liked = delete_like(reference_doctype, reference_name)

    # since likes are embedded in the page, clear the web cache
    if route:
        clear_cache(route)

    if like and ref_doc.enable_email_notification:
        ref_doc_title = ref_doc.get_title()
        subject = _("Like on {0}: {1}").format(reference_doctype, ref_doc_title)
        content = _("You have received a ❤️ like on your dream post:")
        message = f"<p>{content} <b>{ref_doc_title}</b></p>"

        # notify creator
        frappe.sendmail(
            recipients=frappe.db.get_value("User", ref_doc.owner, "email")
            or ref_doc.owner,
            subject=subject,
            message=message,
            reference_doctype=ref_doc.doctype,
            reference_name=ref_doc.name,
        )

    return liked


def add_like(reference_doctype, reference_name):
    user = frappe.session.user

    like = frappe.new_doc("Comment")
    like.comment_type = "Like"
    like.comment_email = user
    like.reference_doctype = reference_doctype
    like.reference_name = reference_name
    like.content = "Liked by: " + user
    if user == "Guest":
        like.ip_address = frappe.local.request_ip
    like.save(ignore_permissions=True)
    return True


def delete_like(reference_doctype, reference_name):
    user = frappe.session.user

    filters = {
        "comment_type": "Like",
        "comment_email": user,
        "reference_doctype": reference_doctype,
        "reference_name": reference_name,
    }

    if user == "Guest":
        filters["ip_address"] = frappe.local.request_ip

    frappe.db.delete("Comment", filters)
    return False

@frappe.whitelist()
def run_lqp_schedules():
    try:
        current_datetime = now_datetime()
        current_date = current_datetime.date()
        current_time = current_datetime.time()

        schedules = frappe.get_all("LQP Schedule", fields=["name", "preset", "frequency", "date", "time_slots", "emails"],filters={"active": 1})

        for schedule in schedules:
            doc = frappe.get_doc("LQP Schedule", schedule.name)
            # Check frequency, date, and time slots
            if should_run_schedule(doc, current_date, current_time):
                generated_numbers, bonus_ball = generate_numbers_from_preset(doc.preset)
                # Send email with generated numbers
                recipients = schedule.emails.split(",")
                recipients.append(doc.owner)
                send_schedule_email(recipients, generated_numbers, bonus_ball, doc.preset_name)
            doc.save()

    except Exception as e:
        error = frappe.get_traceback().replace("<", "&lt;").replace(">", "&gt;")
        logger.error(f"Error running LQP Schedules: {error}")

def should_run_schedule(schedule, current_date, current_time):
    if schedule.frequency == "daily":
        return is_time_slot_match(schedule, current_date, current_time)
    elif schedule.frequency == "weekly" and schedule.date == current_date.strftime("%A"):
        return is_time_slot_match(schedule, current_date, current_time)
    elif schedule.frequency == "monthly" and schedule.date == str(current_date.day):
        return is_time_slot_match(schedule, current_date, current_time)
    return False

def is_time_slot_match(schedule, current_date, current_time):
    logs, time_slots = schedule.run_log, schedule.time_slots
    for slot in time_slots.split(','):
        slot_time = slot.strip()
        # Check if this slot has already been logged for the current date
        if not any(log.slot == slot_time and log.date == current_date for log in logs):
            if current_time >= get_time(slot_time):
                logger.debug(f"run schedule for slot {slot_time}:{current_date}")
                schedule.append("run_log",
                    {
                        "date": current_date,
                        "time": current_time,
                        "slot": slot,
                    }
                )
                return True

    return False

def generate_numbers_from_preset(preset):
    preset = json.loads(preset)
    settings = preset.get("settings", {})
    length = int(settings.get("length", 6))
    min_value = int(settings.get("minValue", 1))
    max_value = int(settings.get("maxValue", 45))
    include_bonus_ball = settings.get("includeBonusBall", False)
    bonus_min_value = int(settings.get("bonusMinValue", 1))
    bonus_max_value = int(settings.get("bonusMaxValue", 15))

    generated_numbers = []
    bonus_ball = None

    for _ in range(length):
        while True:
            num = random.randint(min_value, max_value)
            if num not in generated_numbers:
                generated_numbers.append(num)
                break

    if include_bonus_ball:
        while True:
            bonus = random.randint(bonus_min_value, bonus_max_value)
            if bonus not in generated_numbers:
                bonus_ball = bonus
                break

    return generated_numbers, bonus_ball

def send_schedule_email(recipients, generated_numbers, bonus_ball, preset_name):
    subject = f"LQP Schedule Results: {preset_name}"
    message = f"Generated Lucky Numbers: {', '.join(map(str, generated_numbers))}\nBonus ball: {bonus_ball}"
    company_logo = frappe.get_website_settings("app_logo") or frappe.get_hooks("app_logo_url")[-1]
    site_url = get_url()
    frappe.sendmail(
        recipients=recipients,
        subject=subject,
        template="schedule_results",
        args={"message": message, "logo": company_logo, "site_url": site_url},
    )


@frappe.whitelist()
@rate_limit(key="name", limit=3, seconds=60 * 60)
def disable_schedule(schedule_id, is_enabled):
    try:
        schedule = frappe.get_doc("LQP Schedule", schedule_id)
        schedule.active = frappe.parse_json(is_enabled)
        schedule.save()
        frappe.db.commit()
        return "success"
    except Exception as e:
        logger.error(f"Error disabling schedule: {e}")
        return "error"
