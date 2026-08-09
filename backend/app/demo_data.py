DEMO_SLUGS = ["spotify", "twitter", "whatsapp"]

DEMO_DOCUMENTS: dict[str, str] = {
    "spotify": """By creating an account or using the Spotify service, you agree to these Terms and confirm that you are at least the minimum required age in your country of residence.

We collect information you provide directly, including your name, email address, payment details, and any content you upload, as well as data about the songs and podcasts you play.

We may share your personal information with advertising partners, rights holders, and service providers in order to personalize advertisements and measure their effectiveness.

You grant Spotify a non-exclusive, transferable, sub-licensable, royalty-free, and worldwide license to use, reproduce, and distribute any User Content you post to the service.

Your paid subscription automatically renews at the end of each billing cycle and your payment method will be charged unless you cancel before the renewal date.

To the maximum extent permitted by law, Spotify shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the service.

Any dispute arising out of these Terms shall be resolved exclusively through final and binding individual arbitration, and you waive your right to participate in a class action lawsuit.

We may suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or applicable law.

You may close your account at any time, and you retain ownership of the original content you create and upload to the service.
""",
    "twitter": """By accessing or using our services you agree to be bound by these Terms and all applicable laws and regulations governing the platform.

We collect the personal information you provide when you create an account, including your display name, username, email address, phone number, and profile details.

We share information about your activity with advertisers and business partners so they can deliver tailored advertising and measure engagement across their campaigns.

You retain your rights to any content you submit, post, or display on the services, but you grant us a worldwide, royalty-free license to use, copy, modify, and distribute that content.

We reserve the right to remove content, suspend accounts, or terminate access at our sole discretion and without prior notice for any reason.

The services are provided on an "as is" and "as available" basis, and we disclaim all warranties and shall not be liable for any damages resulting from your use.

You and the company agree that any dispute will be resolved through binding arbitration on an individual basis rather than in court, and class actions are not permitted.

Our subscription features are billed in advance on a recurring basis and fees are non-refundable except where required by law.

You may stop using the services and deactivate your account at any time through your account settings.
""",
    "whatsapp": """By using WhatsApp you agree to our Terms of Service and confirm you are old enough to use the service in your country.

We collect your phone number, profile information, and device information, and we process metadata about how and when you use the service.

We share certain information with the family of companies we are part of and with third-party service providers who help us operate and improve the service.

You are responsible for the content you send through the service, and you grant us a license to use that information to operate and provide our services.

We may modify, suspend, or terminate your access to the service at any time without liability if you violate these Terms.

We provide the service on an "as is" basis without warranties of any kind, and our aggregate liability is limited to the maximum extent permitted by applicable law.

Any dispute relating to these Terms will be resolved exclusively by binding arbitration on an individual basis, and you waive the right to a jury trial and class proceedings.

Certain business features may require payment, and applicable charges are billed according to the plan you select and are non-refundable.

You may delete your account at any time within the application settings, and we will remove your information as described in our Privacy Policy.
""",
}


def demo_source_url(slug: str) -> str:
    return f"demo:{slug}"
