# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: MIT. See LICENSE
import re

import frappe
from frappe import _, scrub
from frappe.rate_limiter import rate_limit
from frappe.utils.html_utils import clean_html
from frappe.website.doctype.blog_settings.blog_settings import get_comment_limit
from frappe.website.utils import clear_cache

URLS_COMMENT_PATTERN = re.compile(
    r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+",
    re.IGNORECASE,
)
EMAIL_PATTERN = re.compile(
    r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)", re.IGNORECASE
)


@frappe.whitelist(allow_guest=True)
@rate_limit(key="reference_name", limit=get_comment_limit, seconds=60 * 60)
def add_comment(
    comment, comment_email=None, comment_by=None, reference_doctype="LQP Dream", reference_name=None, route=None
):
    if frappe.session.user == "Guest":
        return {"error": "Please login to post a comment."}

    if not comment.strip():
        return {"error": "Comment cannot be empty"}

    if URLS_COMMENT_PATTERN.search(comment) or EMAIL_PATTERN.search(comment):
        return {"error": "Dreams cannot have links or email addresses"}

    user = frappe.get_doc("User", frappe.session.user)
    comment_email =  user.email
    comment_by = user.username
    doc = frappe.get_doc(reference_doctype, reference_name)
    comment = doc.add_comment(
        text=clean_html(comment), comment_email=comment_email, comment_by=comment_by
    )

    comment.db_set("published", 1)

    # notify creator
    creator_email = frappe.db.get_value("User", doc.owner, "email") or doc.owner
    if creator_email:
        subject = _("New Comment on {0}: {1}").format(doc.doctype, doc.get_title())

        frappe.sendmail(
            recipients=creator_email,
            subject=subject,
            message=comment.content,
            reference_doctype=doc.doctype,
            reference_name=doc.name,
        )

    return comment.as_dict()
