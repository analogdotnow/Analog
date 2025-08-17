import type { Metadata } from "next";

import {
  LegalHeading1,
  LegalHeading2,
  LegalHeading3,
  LegalList,
  LegalParagraph,
  LegalTextLink,
} from "@/components/landing-page/legal/text";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy - Analog",
};

export default function PrivacyPage() {
  return (
    <main className="relative">
      <div className="relative container mx-auto px-4 pt-32 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <LegalHeading1>Privacy Policy</LegalHeading1>
          </div>
          <Card className="border-2 border-muted/30 bg-background/80 shadow-none">
            <CardContent className="space-y-8 p-8 text-base leading-relaxed">
              <LegalParagraph>
                Your privacy is important to us. It is Analog's policy to
                respect your privacy and comply with any applicable law and
                regulation regarding any personal information we may collect
                about you, including across our website,{" "}
                <LegalTextLink href="https://analog.now">
                  https://analog.now
                </LegalTextLink>
                , and other sites we own and operate.
              </LegalParagraph>

              <LegalParagraph>
                Personal information is any information about you which can be
                used to identify you. This includes information about you as a
                person (such as name, address, and date of birth), your devices,
                payment details, and even information about how you use a
                website or online service.
              </LegalParagraph>

              <LegalParagraph>
                In the event our site contains links to third-party sites and
                services, please be aware that those sites and services have
                their own privacy policies. After following a link to any
                third-party content, you should read their posted privacy policy
                information about how they collect and use personal information.
                This Privacy Policy does not apply to any of your activities
                after you leave our site.
              </LegalParagraph>

              <LegalParagraph>
                This policy is effective as of August 4, 2025
              </LegalParagraph>

              <LegalParagraph>Last updated: August 4, 2025</LegalParagraph>

              <section>
                <LegalHeading2>Information We Collect</LegalHeading2>
                <LegalParagraph>
                  Information we collect falls into one of two categories:
                  "voluntarily provided" information and "automatically
                  collected" information.
                </LegalParagraph>
                <LegalParagraph>
                  "Voluntarily provided" information refers to any information
                  you knowingly and actively provide us when using or
                  participating in any of our services and promotions.
                </LegalParagraph>
                <LegalParagraph>
                  "Automatically collected" information refers to any
                  information automatically sent by your devices in the course
                  of accessing our products and services.
                </LegalParagraph>

                <LegalHeading3>Log Data</LegalHeading3>
                <LegalParagraph>
                  When you visit our website, our servers may automatically log
                  the standard data provided by your web browser. It may include
                  your device's Internet Protocol (IP) address, your browser
                  type and version, the pages you visit, the time and date of
                  your visit, the time spent on each page, and other details
                  about your visit.
                </LegalParagraph>
                <LegalParagraph>
                  Additionally, if you encounter certain errors while using the
                  site, we may automatically collect data about the error and
                  the circumstances surrounding its occurrence. This data may
                  include technical details about your device, what you were
                  trying to do when the error happened, and other technical
                  information relating to the problem. You may or may not
                  receive notice of such errors, even in the moment they occur,
                  that they have occurred, or what the nature of the error is.
                </LegalParagraph>
                <LegalParagraph>
                  Please be aware that while this information may not be
                  personally identifying by itself, it may be possible to
                  combine it with other data to personally identify individual
                  persons.
                </LegalParagraph>

                <LegalHeading3>Device Data</LegalHeading3>
                <LegalParagraph>
                  When you visit our website or interact with our services, we
                  may automatically collect data about your device, such as:
                </LegalParagraph>
                <LegalList>
                  <li>Device Type</li>
                  <li>Operating system</li>
                  <li>Device settings</li>
                  <li>Geo-location data</li>
                </LegalList>
                <LegalParagraph>
                  Data we collect can depend on the individual settings of your
                  device and software. We recommend checking the policies of
                  your device manufacturer or software provider to learn what
                  information they make available to us.
                </LegalParagraph>

                <LegalHeading3>Personal Information</LegalHeading3>
                <LegalParagraph>
                  We may ask for personal information - for example, when you
                  submit content to us, when you register an account or when you
                  contact us — which may include one or more of the following:
                </LegalParagraph>
                <LegalList>
                  <li>Name</li>
                  <li>Email</li>
                </LegalList>
              </section>

              <section>
                <LegalHeading2>Google User Data</LegalHeading2>
                <LegalParagraph>
                  When you link your Google account to Analog, we only ask for
                  the data needed to make the features you choose work.
                </LegalParagraph>

                <LegalHeading3>What we access</LegalHeading3>
                <LegalList>
                  <li>Your Google email address and basic profile</li>
                  <li>Your list of calendars from Google Calendar</li>
                  <li>
                    Details of your calendar events (e.g. title, time,
                    description, attendees, etc.)
                  </li>
                </LegalList>

                <LegalHeading3>Why we access it</LegalHeading3>
                <LegalList>
                  <li>
                    To let you sign in with Google and link your Google Calendar
                    account
                  </li>
                  <li>To display your calendars and events inside Analog</li>
                  <li>
                    To allow you to add and edit events in your calendars from
                    Analog
                  </li>
                </LegalList>

                <LegalParagraph>
                  We{" "}
                  <strong className="font-semibold text-primary">never</strong>{" "}
                  use your Google data for ads, marketing, or profiling.
                </LegalParagraph>
                <LegalParagraph>
                  Human access to Google user data is disallowed except (i) with
                  your explicit in-app permission, (ii) when strictly necessary
                  for security or debugging, or (iii) when required by law.
                </LegalParagraph>
                <LegalParagraph>
                  If we change how we use Google user data, we will (1) update
                  this policy, and (2) prompt you for fresh consent before the
                  new use begins.
                </LegalParagraph>
              </section>
              <section>
                <LegalHeading2>Google Limited Use Disclosure</LegalHeading2>
                <LegalParagraph>
                  We use certain Google API Services (including, but not limited
                  to, Google Sign-In) to give you the option of connecting your
                  Google Account to Analog. When you choose to do so, we may
                  request access to your Google email address, basic profile,
                  and Google Calendar data (calendar list &amp; event details)
                  solely for the purposes listed below. We do not request or
                  access any other Google user data beyond what is described
                  here. We request the minimum scope required to implement the
                  feature you have selected and we never “future-proof” by
                  asking for more.
                </LegalParagraph>
              </section>
              <section>
                <LegalHeading2>
                  Legitimate Reasons for Processing Your Personal Information
                </LegalHeading2>
                <LegalParagraph>
                  We only collect and use your personal information when we have
                  a legitimate reason for doing so. In which instance, we only
                  collect personal information that is reasonably necessary to
                  provide our services to you.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>Collection and Use of Information</LegalHeading2>
                <LegalParagraph>
                  We may collect personal information from you when you do any
                  of the following on our website:
                </LegalParagraph>
                <LegalList>
                  <li>Register for an account</li>
                  <li>
                    Use a mobile device or web browser to access our content
                  </li>
                  <li>
                    Contact us via email, social media, or on any similar
                    technologies
                  </li>
                  <li>When you mention us on social media</li>
                </LegalList>
                <LegalParagraph>
                  We may collect, hold, use, and disclose information for the
                  following purposes, and personal information will not be
                  further processed in a manner that is incompatible with these
                  purposes:
                </LegalParagraph>
                <LegalList>
                  <li>
                    to provide you with our platform's core features and
                    services
                  </li>
                  <li>
                    to enable you to customise or personalise your experience of
                    our website
                  </li>
                  <li>to contact and communicate with you</li>
                  <li>
                    for advertising and marketing, including to send you
                    promotional information about our products and services
                  </li>
                  <li>
                    to enable you to access and use our website, associated
                    applications, and associated social media platforms
                  </li>
                  <li>
                    for internal record keeping and administrative purposes
                  </li>
                  <li>
                    to comply with our legal obligations and resolve any
                    disputes that we may have
                  </li>
                  <li>
                    for security and fraud prevention, and to ensure that our
                    sites and apps are safe, secure, and used in line with our
                    terms of use
                  </li>
                  <li>
                    for technical assessment, including to operate and improve
                    our app, associated applications, and associated social
                    media platforms
                  </li>
                </LegalList>
                <LegalParagraph>
                  This marketing clause does{" "}
                  <strong className="font-semibold text-primary">not</strong>{" "}
                  apply to Google user data obtained via Google API Services,
                  which we use only as described under “Google API Services User
                  Data” above.
                </LegalParagraph>
                <LegalParagraph>
                  We may combine voluntarily provided and automatically
                  collected personal information with general information or
                  research data we receive from other trusted sources. For
                  example, Our marketing and market research activities may
                  uncover data and insights, which we may combine with
                  information about how visitors use our site to improve our
                  site and your experience on it.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>
                  Security of Your Personal Information
                </LegalHeading2>
                <LegalParagraph>
                  When we collect and process personal information, and while we
                  retain this information, we will protect it within
                  commercially acceptable means to prevent loss and theft, as
                  well as unauthorised access, disclosure, copying, use or
                  modification.
                </LegalParagraph>
                <LegalParagraph>
                  Although we will do our best to protect the personal
                  information you provide to us, we advise that no method of
                  electronic transmission or storage is 100% secure and no one
                  can guarantee absolute data security.
                </LegalParagraph>
                <LegalParagraph>
                  You are responsible for selecting any password and its overall
                  security strength, ensuring the security of your own
                  information within the bounds of our services. For example,
                  ensuring any passwords associated with accessing your personal
                  information and accounts are secure and confidential.
                </LegalParagraph>
                <LegalParagraph>
                  All Google user data is encrypted in transit (TLS&nbsp;1.3)
                  and at rest (AES-256).
                </LegalParagraph>
                <LegalParagraph>
                  We accurately represent our identity in every OAuth consent
                  screen and never share our Google client credentials. If we
                  discover any compromise of those credentials, we will promptly
                  rotate them and notify affected users and Google.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>Limited Use Disclosure</LegalHeading2>
                <LegalParagraph>
                  Any use and transfer to any other app of information received
                  from Google APIs will adhere to the{" "}
                  <LegalTextLink href="https://developers.google.com/terms/api-services-user-data-policy">
                    Google API Services User Data Policy
                  </LegalTextLink>
                  , including the Limited Use requirements.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>
                  How Long We Keep Your Personal Information
                </LegalHeading2>
                <LegalParagraph>
                  We keep your personal information only for as long as we need
                  to. This time period may depend on what we are using your
                  information for, in accordance with this privacy policy. For
                  example, if you have provided us with personal information as
                  part of creating an account with us, we may retain this
                  information for the duration your account exists on our
                  system. If your personal information is no longer required for
                  this purpose, we will delete it or make it anonymous by
                  removing all details that identify you.
                </LegalParagraph>
                <LegalParagraph>
                  However, if necessary, we may retain your personal information
                  for our compliance with a legal, accounting, or reporting
                  obligation or for archiving purposes in the public interest,
                  scientific, or historical research purposes or statistical
                  purposes.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>Children's Privacy</LegalHeading2>
                <LegalParagraph>
                  We do not aim any of our products or services directly at
                  children under the age of 13 and we do not knowingly collect
                  personal information about children under 13.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>
                  Disclosure of Personal Information to Third Parties
                </LegalHeading2>
                <LegalParagraph>
                  We may disclose personal information to:
                </LegalParagraph>
                <LegalParagraph>
                  We do{" "}
                  <strong className="font-semibold text-primary">not</strong>{" "}
                  sell, rent, or transfer Google user data to third parties for
                  advertising or any other commercial purpose outside the
                  user-facing features described in this policy.
                </LegalParagraph>
                <LegalList>
                  <li>a parent, subsidiary or affiliate of our company</li>
                  <li>
                    third-party service providers for the purpose of enabling
                    them to provide their services, including (without
                    limitation) IT service providers, data storage, hosting and
                    server providers, error loggers, debt collectors,
                    maintenance or problem-solving providers, marketing
                    providers, professional advisors, and payment systems
                    operators
                  </li>
                  <li>our employees, contractors, and/or related entities</li>
                  <li>our existing or potential agents or business partners</li>
                  <li>
                    credit reporting agencies, courts, tribunals, and regulatory
                    authorities, in the event you fail to pay for goods or
                    services we have provided to you
                  </li>
                  <li>
                    courts, tribunals, regulatory authorities, and law
                    enforcement officers, as required by law, in connection with
                    any actual or prospective legal proceedings, or in order to
                    establish, exercise, or defend our legal rights
                  </li>
                  <li>
                    third parties, including agents or sub-contractors who
                    assist us in providing information, products, services, or
                    direct marketing to you
                  </li>
                  <li>third parties to collect and process data</li>
                  <li>
                    an entity that buys, or to which we transfer all or
                    substantially all of our assets and business
                  </li>
                </LegalList>
                <LegalParagraph>
                  Third parties we currently use include:
                </LegalParagraph>
                <LegalList>
                  <li>Resend</li>
                  <li>Stripe</li>
                </LegalList>
              </section>
              <section>
                <LegalHeading2>
                  International Transfers of Personal Information
                </LegalHeading2>
                <LegalParagraph>
                  The personal information we collect is stored and/or processed
                  in Netherlands (the), Germany, Ireland, or where we or our
                  partners, affiliates, and third-party providers maintain
                  facilities.
                </LegalParagraph>
                <LegalParagraph>
                  The countries to which we store, process, or transfer your
                  personal information may not have the same data protection
                  laws as the country in which you initially provided the
                  information. If we transfer your personal information to third
                  parties in other countries: (i) we will perform those
                  transfers in accordance with the requirements of applicable
                  law; and (ii) we will protect the transferred personal
                  information in accordance with this privacy policy.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>
                  Your Rights and Controlling Your Personal Information
                </LegalHeading2>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Your choice:
                  </strong>{" "}
                  By providing personal information to us, you understand we
                  will collect, hold, use, and disclose your personal
                  information in accordance with this privacy policy. You do not
                  have to provide personal information to us, however, if you do
                  not, it may affect your use of our website or the products
                  and/or services offered on or through it.
                </LegalParagraph>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Information from third parties:
                  </strong>{" "}
                  If we receive personal information about you from a third
                  party, we will protect it as set out in this privacy policy.
                  If you are a third party providing personal information about
                  somebody else, you represent and warrant that you have such
                  person's consent to provide the personal information to us.
                </LegalParagraph>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Marketing permission:
                  </strong>{" "}
                  If you have previously agreed to us using your personal
                  information for direct marketing purposes, you may change your
                  mind at any time by contacting us using the details below.
                </LegalParagraph>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Access:
                  </strong>{" "}
                  You may request details of the personal information that we
                  hold about you.
                </LegalParagraph>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Correction:
                  </strong>{" "}
                  If you believe that any information we hold about you is
                  inaccurate, out of date, incomplete, irrelevant, or
                  misleading, please contact us using the details provided in
                  this privacy policy. We will take reasonable steps to correct
                  any information found to be inaccurate, incomplete,
                  misleading, or out of date.
                </LegalParagraph>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Non-discrimination:
                  </strong>{" "}
                  We will not discriminate against you for exercising any of
                  your rights over your personal information. Unless your
                  personal information is required to provide you with a
                  particular service or offer (for example providing user
                  support), we will not deny you goods or services and/or charge
                  you different prices or rates for goods or services, including
                  through granting discounts or other benefits, or imposing
                  penalties, or provide you with a different level or quality of
                  goods or services.
                </LegalParagraph>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Downloading of Personal Information:
                  </strong>{" "}
                  We provide a means for you to download the personal
                  information you have shared through our site. Please contact
                  us for more information.
                </LegalParagraph>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Notification of data breaches:
                  </strong>{" "}
                  We will comply with laws applicable to us in respect of any
                  data breach.
                </LegalParagraph>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Complaints:
                  </strong>{" "}
                  If you believe that we have breached a relevant data
                  protection law and wish to make a complaint, please contact us
                  using the details below and provide us with full details of
                  the alleged breach. We will promptly investigate your
                  complaint and respond to you, in writing, setting out the
                  outcome of our investigation and the steps we will take to
                  deal with your complaint. You also have the right to contact a
                  regulatory body or data protection authority in relation to
                  your complaint.
                </LegalParagraph>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Unsubscribe:
                  </strong>{" "}
                  To unsubscribe from our email database or opt-out of
                  communications (including marketing communications), please
                  contact us using the details provided in this privacy policy,
                  or opt-out using the opt-out facilities provided in the
                  communication. We may need to request specific information
                  from you to help us confirm your identity.
                </LegalParagraph>

                <LegalHeading3>Disconnect Google Account</LegalHeading3>
                <LegalParagraph>
                  You may revoke Analog’s access to your Google Account at any
                  time by visiting{" "}
                  <LegalTextLink href="https://myaccount.google.com/permissions">
                    https://myaccount.google.com/permissions
                  </LegalTextLink>{" "}
                  or by clicking{" "}
                  <strong className="font-semibold text-primary">
                    Disconnect
                  </strong>{" "}
                  in your account settings inside Analog. This will delete any
                  tokens we hold and disable Google-powered features.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>Business Transfers</LegalHeading2>
                <LegalParagraph>
                  If we or our assets are acquired, or in the unlikely event
                  that we go out of business or enter bankruptcy, we would
                  include data, including your personal information, among the
                  assets transferred to any parties who acquire us. You
                  acknowledge that such transfers may occur, and that any
                  parties who acquire us may, to the extent permitted by
                  applicable law, continue to use your personal information
                  according to this policy, which they will be required to
                  assume as it is the basis for any ownership or use rights we
                  have over such information.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>Limits of Our Policy</LegalHeading2>
                <LegalParagraph>
                  Our website may link to external sites that are not operated
                  by us. Please be aware that we have no control over the
                  content and policies of those sites, and cannot accept
                  responsibility or liability for their respective privacy
                  practices.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>Changes to This Policy</LegalHeading2>
                <LegalParagraph>
                  At our discretion, we may change our privacy policy to reflect
                  updates to our business processes, current acceptable
                  practices, or legislative or regulatory changes. If we decide
                  to change this privacy policy, we will post the changes here
                  at the same link by which you are accessing this privacy
                  policy.
                </LegalParagraph>
                <LegalParagraph>
                  If the changes are significant, or if required by applicable
                  law, we will contact you (based on your selected preferences
                  for communications from us) and all our registered users with
                  the new details and links to the updated or changed policy.
                </LegalParagraph>
                <LegalParagraph>
                  If required by law, we will get your permission or give you
                  the opportunity to opt in to or opt out of, as applicable, any
                  new uses of your personal information.
                </LegalParagraph>
                <LegalParagraph>
                  For changes that materially affect how we handle Google user
                  data, we will (1) email or in-app notify you, (2) update this
                  policy, and (3) request your explicit consent before the new
                  use takes effect.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>
                  Additional Disclosures for General Data Protection Regulation
                  (GDPR) Compliance (EU)
                </LegalHeading2>

                <LegalHeading3>Data Controller / Data Processor</LegalHeading3>
                <LegalParagraph>
                  The GDPR distinguishes between organizations that process
                  personal information for their own purposes (known as "data
                  controllers") and organizations that process personal
                  information on behalf of other organizations (known as "data
                  processors"). We, Analog, located at the address provided in
                  our Contact Us section, are a Data Controller with respect to
                  the personal information you provide to us.
                </LegalParagraph>

                <LegalHeading3>
                  Legal Bases for Processing Your Personal Information
                </LegalHeading3>
                <LegalParagraph>
                  We will only collect and use your personal information when we
                  have a legal right to do so. In which case, we will collect
                  and use your personal information lawfully, fairly, and in a
                  transparent manner. If we seek your consent to process your
                  personal information, and you are under 16 years of age, we
                  will seek your parent or legal guardian's consent to process
                  your personal information for that specific purpose.
                </LegalParagraph>
                <LegalParagraph>
                  Our lawful bases depend on the services you use and how you
                  use them. This means we only collect and use your information
                  on the following grounds:
                </LegalParagraph>

                <LegalHeading3>Consent From You</LegalHeading3>
                <LegalParagraph>
                  Where you give us consent to collect and use your personal
                  information for a specific purpose. You may withdraw your
                  consent at any time using the facilities we provide; however
                  this will not affect any use of your information that has
                  already taken place. You may consent to providing your email
                  address for the purpose of receiving marketing emails from us.
                  While you may unsubscribe at any time, we cannot recall any
                  email we have already sent. If you have any further enquiries
                  about how to withdraw your consent, please feel free to
                  enquire using the details provided in the Contact Us section
                  of this privacy policy.
                </LegalParagraph>

                <LegalHeading3>
                  Performance of a Contract or Transaction
                </LegalHeading3>
                <LegalParagraph>
                  Where you have entered into a contract or transaction with us,
                  or in order to take preparatory steps prior to our entering
                  into a contract or transaction with you. For example, if you
                  contact us with an enquiry, we may require personal
                  information such as your name and contact details in order to
                  respond.
                </LegalParagraph>

                <LegalHeading3>Our Legitimate Interests</LegalHeading3>
                <LegalParagraph>
                  Where we assess it is necessary for our legitimate interests,
                  such as for us to provide, operate, improve and communicate
                  our services. We consider our legitimate interests to include
                  research and development, understanding our audience,
                  marketing and promoting our services, measures taken to
                  operate our services efficiently, marketing analysis, and
                  measures taken to protect our legal rights and interests.
                </LegalParagraph>

                <LegalHeading3>Compliance With the Law</LegalHeading3>
                <LegalParagraph>
                  In some cases, we may have a legal obligation to use or keep
                  your personal information. Such cases may include (but are not
                  limited to) court orders, criminal investigations, government
                  requests, and regulatory obligations. If you have any further
                  enquiries about how we retain personal information in order to
                  comply with the law, please feel free to enquire using the
                  details provided in the Contact Us section of this privacy
                  policy.
                </LegalParagraph>

                <LegalHeading3>
                  International Transfers Outside of the European Economic Area
                  (EEA)
                </LegalHeading3>
                <LegalParagraph>
                  We will ensure that any transfer of personal information from
                  countries in the European Economic Area (EEA) to countries
                  outside the EEA will be protected by appropriate safeguards,
                  for example by using standard data protection clauses approved
                  by the European Commission, or the use of binding corporate
                  rules or other legally accepted means.
                </LegalParagraph>

                <LegalHeading3>
                  Your Rights and Controlling Your Personal Information
                </LegalHeading3>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Restrict:
                  </strong>{" "}
                  You have the right to request that we restrict the processing
                  of your personal information if:
                </LegalParagraph>
                <ol className="mb-4 list-decimal space-y-2 pl-6">
                  <li>
                    you are concerned about the accuracy of your personal
                    information;
                  </li>
                  <li>
                    you believe your personal information has been unlawfully
                    processed;
                  </li>
                  <li>
                    you need us to maintain the personal information solely for
                    the purpose of a legal claim; or
                  </li>
                  <li>
                    we are in the process of considering your objection in
                    relation to processing on the basis of legitimate interests.
                  </li>
                </ol>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Objecting to processing:
                  </strong>{" "}
                  You have the right to object to processing of your personal
                  information that is based on our legitimate interests or
                  public interest. If this is done, we must provide compelling
                  legitimate grounds for the processing which overrides your
                  interests, rights, and freedoms, in order to proceed with the
                  processing of your personal information.
                </LegalParagraph>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Data portability:
                  </strong>{" "}
                  You may have the right to request a copy of the personal
                  information we hold about you. Where possible, we will provide
                  this information in CSV format or other easily readable
                  machine format. You may also have the right to request that we
                  transfer this personal information to a third party.
                </LegalParagraph>
                <LegalParagraph>
                  <strong className="font-semibold text-primary">
                    Deletion:
                  </strong>{" "}
                  You may have a right to request that we delete the personal
                  information we hold about you at any time, and we will take
                  reasonable steps to delete your personal information from our
                  current records. If you ask us to delete your personal
                  information, we will let you know how the deletion affects
                  your use of our website or products and services. There may be
                  exceptions to this right for specific legal reasons which, if
                  applicable, we will set out for you in response to your
                  request. If you terminate or delete your account, we will
                  delete your personal information within 30 days of the
                  deletion of your account. Please be aware that search engines
                  and similar third parties may still retain copies of your
                  personal information that has been made public at least once,
                  like certain profile information and public comments, even
                  after you have deleted the information from our services or
                  deactivated your account.
                </LegalParagraph>
              </section>

              <section>
                <LegalHeading2>Contact Us</LegalHeading2>
                <LegalParagraph>
                  For any questions or concerns regarding your privacy, you may
                  contact us using the following details:
                </LegalParagraph>
                <LegalParagraph>
                  Jean P.D. Meijer
                  <br />
                  <LegalTextLink href="mailto:jean@analoginterface.io">
                    jean@analoginterface.io
                  </LegalTextLink>
                </LegalParagraph>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
