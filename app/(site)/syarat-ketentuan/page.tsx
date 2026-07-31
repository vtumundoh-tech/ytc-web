import { ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";

const TIKTOK_URL = "https://www.tiktok.com/@mineclipstudio";
const YOUTUBE_URL = "https://www.youtube.com/@Mineclips_collection";
const WHATSAPP_URL = "https://wa.me/6282395912267";

const TOC_PART1: [string, string][] = [
  ["1", "License Terms"],
  ["2", "Payment Methods"],
  ["3", "No Refund Policy"],
  ["4", "Prohibited Actions & System Manipulation"],
  ["5", "Violation Detection & Access Blocking"],
  ["6", "70% Penalty & Unlock Key"],
  ["7", "Unlock Key Validity"],
  ["8", "Additional Consequences"],
  ["9", "Cashback Terms"],
  ["10", "Personal Data"],
  ["11", "Limitation of Liability"],
  ["12", "Intellectual Property Rights"],
  ["13", "License Termination"],
  ["14", "Governing Law"],
  ["15", "Privacy Policy"],
];

const TOC_PART2: [string, string][] = [
  ["1", "Data We Collect"],
  ["2", "How We Use Your Data"],
  ["3", "Legal Basis & Consent"],
  ["4", "Storage & Security"],
  ["5", "Data Sharing"],
  ["6", "Data Retention"],
  ["7", "Your Rights"],
  ["8", "Contact Us"],
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Terms & Conditions and Privacy Policy</h1>
        <p className="text-sm text-gray-500 mt-1">YouTube Clipper — Complete Terms of Service, License Agreement, and Privacy Policy</p>
        <span className="inline-block mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200/50 tracking-widest">
          EFFECTIVE JULY 27, 2026
        </span>
      </div>

      <div className="card-lg space-y-8 text-sm text-gray-600 leading-relaxed">
        {/* ─── PART 1 ─── */}
        <PartTitle num="PART 1" title="Terms & Conditions" />
        <Toc items={TOC_PART1} />

        <Section num="1" title="License Terms">
          <p>1.1 The license is non-exclusive, non-transferable, and limited to the selected rental duration.</p>
          <p>1.2 Each license is tied to a specific device Machine ID. It cannot be transferred to another device without written permission from the developer.</p>
          <p>1.3 The license key and application are delivered after payment is confirmed. They are digital — sent via email or WhatsApp.</p>
          <p>1.4 Prices include VAT (if applicable). Prices may change at any time. Purchases follow the price at the time of transaction.</p>
        </Section>

        <Section num="2" title="Payment Methods">
          <p>2.1 Payments are processed via QRIS or bank transfer.</p>
          <p>2.2 After successful payment, the system automatically generates the license key.</p>
          <p>2.3 The key and application are sent via email or WhatsApp.</p>
        </Section>

        <Section num="3" title="No Refund Policy">
          <p>3.1 All license purchases are final and non-refundable.</p>
          <p>3.2 Licenses are digital goods delivered immediately after payment. They cannot be returned.</p>
          <p>3.3 No refund for unused remaining validity period.</p>
          <p>3.4 No refund if access is blocked due to EULA violation.</p>
          <p>3.5 By making a purchase, the customer agrees to and explicitly waives their right to a refund.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 15. Cashback clause 9)</p>
        </Section>

        <Section num="4" title="Prohibited Actions & System Manipulation">
          <p>Customers are strictly prohibited from:</p>
          <p>4.1 Manipulating, rolling back, or altering the system clock to extend the license.</p>
          <p>4.2 Deleting, modifying, or damaging ClipperGuard checkpoint files.</p>
          <p>4.3 Stopping, disabling, or interfering with the ClipperGuard service.</p>
          <p>4.4 Reverse engineering the license system.</p>
          <p>4.5 Using third-party tools to bypass the license.</p>
          <p>4.6 Sharing, reselling, or distributing keys to third parties.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 10)</p>
        </Section>

        <Section num="5" title="Violation Detection & Access Blocking">
          <p>5.1 ClipperGuard monitors system integrity periodically.</p>
          <p>5.2 If a violation is detected (including but not limited to: time manipulation, checkpoint tampering, service interference):</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>The violation is recorded in the checkpoint file</li>
            <li>The application enters Block Mode — all features are disabled</li>
            <li>A Violation Code is generated and displayed to the user</li>
            <li>The customer must contact the Admin to obtain an Unlock Key</li>
          </ul>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 11)</p>
        </Section>

        <Section num="6" title="70% Penalty & Unlock Key">
          <p>6.1 To restore access after a violation, the customer must:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Copy the Violation Code from the blocked page</li>
            <li>Contact Admin via WhatsApp and send the code</li>
            <li>Pay a 70% penalty of the package price</li>
            <li>Admin will generate an Unlock Key based on the violation code</li>
            <li>Enter the Unlock Key on the blocked page to restore access</li>
          </ul>
          <p>6.2 The Unlock Key is tied to the specific machine, violation, and remaining license duration. It cannot be transferred or reused after the license expires.</p>
          <p>6.3 If the customer does not wish to pay the penalty, they may wait until the block period ends automatically (based on remaining license duration).</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 12)</p>
        </Section>

        <Section num="7" title="Unlock Key Validity">
          <p>7.1 The Unlock Key is only valid for the remaining duration of the original license.</p>
          <p>7.2 When the original license expires, the block is automatically lifted.</p>
          <p>7.3 After expiration, the customer may purchase a new package normally.</p>
          <p>7.4 THE DEVELOPER RESERVES THE RIGHT to refuse new purchases from customers with a history of repeated violations.</p>
          <p>7.5 If a customer attempts to activate a new key while still in Block Mode, the system will reject it with the message: "This key cannot be used while your access is blocked. Please use an Unlock Key first."</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Articles 13 & 16)</p>
        </Section>

        <Section num="8" title="Additional Consequences">
          <p>The developer reserves the right to:</p>
          <p>8.1 Refuse to issue an Unlock Key for repeated or severe violations.</p>
          <p>8.2 Refuse to sell new packages to customers who have violated terms.</p>
          <p>8.3 Permanently ban a Machine ID.</p>
          <p>8.4 Pursue legal action if the violation causes financial loss.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 14)</p>
        </Section>

        <Section num="9" title="Cashback Terms">
          <p className="font-semibold text-gray-700">9.1 General Terms</p>
          <ul className="list-disc list-inside pl-2 space-y-1 mb-3">
            <li>Cashback applies only to purchases with Cashback Eligible status.</li>
            <li>Cashback is non-cash, transferred to the registered WhatsApp number or email.</li>
            <li>Cashback can only be claimed once per key.</li>
            <li>Cashback cannot be combined with other promotions.</li>
          </ul>

          <p className="font-semibold text-gray-700">9.2 Claim Requirements</p>
          <ol className="list-decimal list-inside pl-2 space-y-1 mb-3">
            <li>
              Support the developer by following{" "}
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-semibold underline underline-offset-2 hover:text-violet-700">
                TikTok @mineclipstudio
              </a>{" "}
              or subscribing to the{" "}
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-semibold underline underline-offset-2 hover:text-violet-700">
                YouTube Channel @Mineclips_collection
              </a>
            </li>
            <li>Like &amp; comment on at least 3 posts — either on TikTok or YouTube. MUST be different posts for each claim. Liking/commenting on the same post repeatedly is not valid.</li>
            <li>Share the video to at least 3 friends, or upload it to your Story (sharing 3× to our account is allowed; for Story, a screenshot once it is live is enough).</li>
            <li>Follow, like, comment, and subscribe MUST be maintained for at least 7 days. If the customer is found to have stopped earlier, the cashback will not be paid out.</li>
            <li>Attach screenshots as proof for each step.</li>
            <li>Fill in the data correctly and completely — it must match the data submitted at the time of purchase for tracking purposes.</li>
          </ol>

          <p className="font-semibold text-gray-700">9.3 Cashback Amounts</p>
          <p>Refer to the cashback table on the homepage or claim page for current cashback rates per package.</p>

          <p className="font-semibold text-gray-700 mt-3">9.4 Claim Process</p>
          <ol className="list-decimal list-inside pl-2 space-y-1 mb-3">
            <li>Customer fulfills the requirements in clause 9.2.</li>
            <li>Customer fills in the cashback claim form.</li>
            <li>Admin verifies the proof within a maximum of 1x24 hours.</li>
            <li>If valid → status set to Approved.</li>
            <li>Payout is processed at least 7 days after the key is activated. Proof of transfer is sent to the registered WhatsApp number or email.</li>
            <li>If proof is invalid → Rejected.</li>
          </ol>

          <p className="font-semibold text-gray-700">9.5 Penalties & Blacklist</p>
          <p>Customers found to be committing fraud (including: fake accounts, bots, duplicate claims, using the same post for repeated claims, or stopping follow/like/subscribe within the 7-day period):</p>
          <ul className="list-disc list-inside pl-2 space-y-1 mb-3">
            <li>Cashback claim permanently rejected</li>
            <li>Blacklisted &amp; unable to purchase new keys</li>
            <li>Active keys may be revoked without refund</li>
          </ul>

          <p className="font-semibold text-gray-700">9.6 Other Terms</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Cashback cannot be transferred to another number.</li>
            <li>Incorrect WhatsApp number during registration is not the responsibility of the Admin.</li>
            <li>Admin decisions are final.</li>
            <li>Terms &amp; conditions may change at any time.</li>
          </ul>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 6)</p>
        </Section>

        <Section num="10" title="Personal Data">
          <p>10.1 Customer data (name, WhatsApp number, email, Machine ID, and payment proof) is used only for activation, payment verification, cashback processing, and support purposes.</p>
          <p>10.2 Data is not sold or shared with third parties, except where required by Indonesian law (Law No. 27/2022 on Personal Data Protection) or upon a valid request from authorized authorities.</p>
          <p>10.3 Details are set out in the full Privacy Policy in Part 2 of this document, which forms an integral and mutually binding part of this agreement.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 17)</p>
        </Section>

        <Section num="11" title="Limitation of Liability">
          <p>11.1 The software is provided "as is" without any warranty.</p>
          <p>11.2 The developer is not liable for:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Direct, indirect, incidental, or consequential damages</li>
            <li>Loss of data or revenue</li>
            <li>Business interruption resulting from use of this software</li>
            <li>Third-party claims</li>
          </ul>
          <p>11.3 The developer does not guarantee the software is free from errors (bugs) or will function without interruptions.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 5)</p>
        </Section>

        <Section num="12" title="Intellectual Property Rights">
          <p>12.1 All copyright, ownership, and intellectual property rights to this software remain with the developer (MineClip Studio).</p>
          <p>12.2 This license does not grant ownership of the source code, algorithms, or technology used.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 4)</p>
        </Section>

        <Section num="13" title="License Termination">
          <p>The license terminates automatically if:</p>
          <p>13.1 The rental period expires.</p>
          <p>13.2 The customer violates the terms of the EULA.</p>
          <p>13.3 The developer decides to discontinue the service.</p>
          <p>Upon termination, the customer must delete all copies of the software.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 7)</p>
        </Section>

        <Section num="14" title="Governing Law">
          <p>14.1 This agreement is governed by the laws of the Republic of Indonesia.</p>
          <p>14.2 Disputes shall first be resolved through deliberation.</p>
          <p>14.3 If no agreement is reached, disputes shall be settled in the competent District Court.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 8)</p>
        </Section>

        <Section num="15" title="Privacy Policy" id="privacy-policy">
          <p>15.1 Customer personal data (name, WhatsApp number, email, Machine ID, and payment proof) is collected and processed solely for license activation, payment verification, cashback claims, and customer support.</p>
          <p>15.2 Personal data is not sold, rented, or shared with any third party, except where required by Indonesian law (Law No. 27/2022 on Personal Data Protection) or upon a valid request from authorized authorities.</p>
          <p>15.3 Data is retained for as long as the customer holds an active license or as required by applicable law.</p>
          <p>15.4 Customers may request access to, correction of, or deletion of their personal data by contacting the Admin.</p>
          <p>15.5 By accepting these Terms &amp; Conditions, the customer also agrees to the full Privacy Policy in Part 2 of this document, which forms an integral and mutually binding part of this agreement.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 17)</p>
        </Section>

        {/* ─── PART 2 ─── */}
        <PartTitle num="PART 2" title="Privacy Policy" />
        <Toc items={TOC_PART2} />

        <p>
          This Privacy Policy explains how <strong className="text-gray-700">MineClip Studio</strong> ("we", "our", "us") collects, uses, stores, and protects your personal data when you use YouTube Clipper, purchase a license, or claim a cashback. By using our software and services, you agree to the practices described in this policy. This Privacy Policy forms an integral and mutually binding part of our <strong className="text-gray-700">Terms &amp; Conditions</strong> (Article 15).
        </p>

        <Section num="1" title="Data We Collect">
          <p>We collect the following personal data from customers:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong className="text-gray-700">Name</strong> — submitted during the purchase form.</li>
            <li><strong className="text-gray-700">WhatsApp number</strong> — used for key delivery, confirmation, and cashback transfer.</li>
            <li><strong className="text-gray-700">Email address</strong> (optional) — alternative contact if WhatsApp cannot be reached.</li>
            <li><strong className="text-gray-700">Machine ID</strong> (12-digit code) — used to bind the license key to a specific device.</li>
            <li><strong className="text-gray-700">Payment proof</strong> (screenshot/photo of transfer) — used to verify payment.</li>
            <li><strong className="text-gray-700">Cashback proof</strong> (screenshots of follow, like, comment, share) — used to verify cashback claims.</li>
          </ul>
        </Section>

        <Section num="2" title="How We Use Your Data">
          <p>Your personal data is used solely for the following purposes:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>License activation and validation.</li>
            <li>Payment verification and order processing.</li>
            <li>Processing and verifying cashback claims.</li>
            <li>Customer support and communication.</li>
            <li>Security — detecting and preventing license abuse or fraud.</li>
          </ul>
          <p>We do not use your data for purposes other than those stated above without your consent.</p>
        </Section>

        <Section num="3" title="Legal Basis & Consent">
          <p>We process your personal data based on your explicit consent, which you give by ticking the "I agree to the Terms &amp; Conditions" checkbox at the time of purchase, and by submitting your data through our forms. This processing is carried out in accordance with Indonesian Law No. 27 of 2022 on Personal Data Protection (UU PDP).</p>
          <p>By proceeding with a purchase or a cashback claim, you confirm that you have read, understood, and agreed to this Privacy Policy and the Terms &amp; Conditions.</p>
        </Section>

        <Section num="4" title="Storage & Security">
          <p>Your personal data is stored in the developer&apos;s administrative database. Access is restricted to the developer only and is used exclusively for the purposes described in this policy.</p>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 leading-relaxed">
            <strong>Please note:</strong> Your data is not encrypted at the application level. You should avoid submitting sensitive information beyond what is required by our forms.
          </div>
        </Section>

        <Section num="5" title="Data Sharing">
          <p>We do <strong className="text-gray-700">not</strong> sell, rent, trade, or share your personal data with any third party for marketing or any other commercial purposes.</p>
          <p>The only exceptions are:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Where disclosure is required by applicable Indonesian law or upon a valid request from authorized authorities.</li>
            <li>Where necessary to protect our legal rights (e.g., pursuing action against license abuse or fraud).</li>
          </ul>
        </Section>

        <Section num="6" title="Data Retention">
          <p>We retain your personal data for as long as you hold an active license or as long as required by applicable law. If you request deletion, we will remove your data within a reasonable period, subject to any legal obligations to retain it (for example, for fraud investigations or pending disputes).</p>
        </Section>

        <Section num="7" title="Your Rights">
          <p>In accordance with applicable data protection law, you have the right to:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong className="text-gray-700">Access</strong> — request a copy of the personal data we hold about you.</li>
            <li><strong className="text-gray-700">Correction</strong> — request that inaccurate data be corrected.</li>
            <li><strong className="text-gray-700">Deletion</strong> — request that your personal data be deleted.</li>
            <li><strong className="text-gray-700">Withdraw consent</strong> — object to the processing of your data.</li>
          </ul>
          <p>To exercise any of these rights, contact the Admin using the details below. We will respond within a reasonable time.</p>
        </Section>

        <Section num="8" title="Contact Us">
          <p>If you have any questions about this Privacy Policy, or wish to exercise your rights, contact us at:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>
              <strong className="text-gray-700">WhatsApp:</strong>{" "}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-medium underline underline-offset-2 hover:text-violet-700">+62 823-9591-2267</a>
            </li>
            <li>
              <strong className="text-gray-700">Email:</strong>{" "}
              <a href="mailto:mineclipstudios@gmail.com" className="text-violet-600 font-medium underline underline-offset-2 hover:text-violet-700">mineclipstudios@gmail.com</a>
            </li>
          </ul>
        </Section>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-800 leading-relaxed">
          <strong>By using YouTube Clipper, you acknowledge that you have read, understood, and agree to the full Terms &amp; Conditions and this Privacy Policy.</strong>
        </div>
      </div>

      <div className="text-center mt-8 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400">YouTube Clipper — Terms &amp; Conditions and Privacy Policy</p>
        <p className="text-xs text-gray-500 mt-1">
          <strong className="text-gray-600">MineClip Studio</strong> | Version 1.1 | Effective July 27, 2026
        </p>
      </div>

      <div className="text-center mt-8">
        <Link href="/beli" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
          &larr; Kembali ke pembelian
        </Link>
      </div>
    </div>
  );
}

function PartTitle({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-bold tracking-wide">{num}</span>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function Toc({ items }: { items: [string, string][] }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs">
      <p className="font-bold text-gray-700 mb-2 uppercase tracking-wider text-[11px]">Contents</p>
      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 list-none">
        {items.map(([num, label]) => (
          <li key={num}>
            <a
              href={num === "15" && label === "Privacy Policy" ? "#privacy-policy" : `#sec-${num}`}
              className="text-gray-500 hover:text-violet-600 hover:underline underline-offset-2 transition-colors"
            >
              {num}. {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({ num, title, id, children }: { num: string; title: string; id?: string; children: React.ReactNode }) {
  return (
    <div id={id || `sec-${num}`}>
      <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] bg-emerald-600 text-white rounded-lg text-xs px-1.5 shrink-0">{num}</span>
        {title}
      </h2>
      <div className="space-y-2 pl-1">
        {children}
      </div>
    </div>
  );
}
