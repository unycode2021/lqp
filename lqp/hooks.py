app_name = "lqp"
app_title = "LQP"
app_publisher = "Unycode Limited"
app_description = "Random Number Generator for Lottery sequence"
app_email = "cep@unycode.net"
app_license = "mit"
app_logo_url = "/assets/lqp/img/lqp_logo.jpeg"
# required_apps = []

# Includes in <head>
# ------------------
website_context = {
    "favicon": "/assets/lqp/img/favicon.ico",
    "splash_image": "/assets/lqp/img/lqp_logo.jpeg",
}
# include js, css files in header of desk.html
# app_include_css = "/assets/lqp/css/lqp.css"
# app_include_js = "/assets/lqp/js/lqp.js"

# include js, css files in header of web template
# web_include_css = "/assets/lqp/css/lqp.css"
# web_include_js = "/assets/lqp/js/lqp.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "lqp/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}
brand_html = '<div><img src="/assets/lqp/img/logo.png"/> Dream Reader</div>'

email_brand_image = "/assets/lqp/img/logo.png"

default_mail_footer = """
    <div>
        Sent via <a href="https://lqp.unycode.net/#lqp?source=via_email_footer" target="_blank">Lottery Quick Print - LQP</a>
        <p>Powered by Unycode Limited - All rights reserved</p>
    </div>
"""
# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "lqp/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# website_route_rules = [
#     {"from_route": "/dreams/<path:app_path>", "to_route": "dreams"},
# ]
# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "lqp.utils.jinja_methods",
# 	"filters": "lqp.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "lqp.install.before_install"
# after_install = "lqp.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "lqp.uninstall.before_uninstall"
# after_uninstall = "lqp.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "lqp.utils.before_app_install"
# after_app_install = "lqp.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "lqp.utils.before_app_uninstall"
# after_app_uninstall = "lqp.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "lqp.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

scheduler_events = {
        "all": [
            "lqp.api.run_lqp_schedules",
        ],
    
}
# scheduler_events = {
# 	"all": [
# 		"lqp.tasks.all"
# 	],
# 	"daily": [
# 		"lqp.tasks.daily"
# 	],
# 	"hourly": [
# 		"lqp.tasks.hourly"
# 	],
# 	"weekly": [
# 		"lqp.tasks.weekly"
# 	],
# 	"monthly": [
# 		"lqp.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "lqp.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "lqp.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "lqp.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["lqp.utils.before_request"]
# after_request = ["lqp.utils.after_request"]

# Job Events
# ----------
# before_job = ["lqp.utils.before_job"]
# after_job = ["lqp.utils.after_job"]

# User Data Protection
# --------------------

user_data_fields = [
	{
		"doctype": "LQP Dream",
		"redact_fields": ["name", "owner"],
		"partial": 1,
	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"lqp.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }
