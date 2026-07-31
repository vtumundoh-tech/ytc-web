import { ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";

const TIKTOK_URL = "https://www.tiktok.com/@mineclipstudio";
const YOUTUBE_URL = "https://www.youtube.com/@Mineclips_collection";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Terms & Conditions</h1>
        <p className="text-sm text-gray-500 mt-1">YouTube Clipper — Complete Terms of Service and License Agreement</p>
      </div>

      <div className="card-lg space-y-8 text-sm text-gray-600 leading-relaxed">
        <Section title="1. License Terms">
          <p>1.1 The license is non-exclusive, non-transferable, and limited to the selected rental duration.</p>
          <p>1.2 Each license is tied to a specific device Machine ID. It cannot be transferred to another device without written permission from the developer.</p>
          <p>1.3 The license key and application are delivered after payment is confirmed. They are digital — sent via email or WhatsApp.</p>
          <p>1.4 Prices include VAT (if applicable). Prices may change at any time. Purchases follow the price at the time of transaction.</p>
        </Section>

        <Section title="2. Payment Methods">
          <p>2.1 Payments are processed via QRIS or bank transfer.</p>
          <p>2.2 After successful payment, the system automatically generates the license key.</p>
          <p>2.3 The key and application are sent via email or WhatsApp.</p>
        </Section>

        <Section title="3. No Refund Policy">
          <p>3.1 All license purchases are final and non-refundable.</p>
          <p>3.2 Licenses are digital goods delivered immediately after payment. They cannot be returned.</p>
          <p>3.3 No refund for unused remaining validity period.</p>
          <p>3.4 No refund if access is blocked due to EULA violation.</p>
          <p>3.5 By making a purchase, the customer agrees to and explicitly waives their right to a refund.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 15. Cashback clause 9)</p>
        </Section>

        <Section title="4. Prohibited Actions & System Manipulation">
          <p>Customers are strictly prohibited from:</p>
          <p>4.1 Manipulating, rolling back, or altering the system clock to extend the license.</p>
          <p>4.2 Deleting, modifying, or damaging ClipperGuard checkpoint files.</p>
          <p>4.3 Stopping, disabling, or interfering with the ClipperGuard service.</p>
          <p>4.4 Reverse engineering the license system.</p>
          <p>4.5 Using third-party tools to bypass the license.</p>
          <p>4.6 Sharing, reselling, or distributing keys to third parties.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 10)</p>
        </Section>

        <Section title="5. Violation Detection & Access Blocking">
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

        <Section title="6. 70% Penalty & Unlock Key">
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

        <Section title="7. Unlock Key Validity">
          <p>7.1 The Unlock Key is only valid for the remaining duration of the original license.</p>
          <p>7.2 When the original license expires, the block is automatically lifted.</p>
          <p>7.3 After expiration, the customer may purchase a new package normally.</p>
          <p>7.4 THE DEVELOPER RESERVES THE RIGHT to refuse new purchases from customers with a history of repeated violations.</p>
          <p>7.5 If a customer attempts to activate a new key while still in Block Mode, the system will reject it with the message: "This key cannot be used while your access is blocked. Please use an Unlock Key first."</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Articles 13 & 16)</p>
        </Section>

        <Section title="8. Additional Consequences">
          <p>The developer reserves the right to:</p>
          <p>8.1 Refuse to issue an Unlock Key for repeated or severe violations.</p>
          <p>8.2 Refuse to sell new packages to customers who have violated terms.</p>
          <p>8.3 Permanently ban a Machine ID.</p>
          <p>8.4 Pursue legal action if the violation causes financial loss.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 14)</p>
        </Section>

        <Section title="9. Cashback Terms">
          <p className="font-semibold text-gray-700">9.1 General Terms</p>
          <ul className="list-disc list-inside pl-2 space-y-1 mb-3">
            <li>Cashback applies only to purchases with Cashback Eligible status.</li>
            <li>Cashback is non-cash, transferred to the registered WhatsApp number.</li>
            <li>Cashback can only be claimed once per key.</li>
            <li>Cashback cannot be combined with other promotions.</li>
          </ul>

          <p className="font-semibold text-gray-700">9.2 Claim Requirements</p>
          <ol className="list-decimal list-inside pl-2 space-y-1 mb-3">
            <li>
              Support us by following{" "}
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-semibold underline underline-offset-2 hover:text-violet-700">
                TikTok @mineclipstudio
              </a>{" "}
              or subscribing to the{" "}
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-semibold underline underline-offset-2 hover:text-violet-700">
                YouTube Channel @Mineclips_collection
              </a>
            </li>
            <li>Like &amp; comment on at least 3 of our posts — on TikTok or YouTube — MUST be different posts for each claim.</li>
            <li>Share the video to at least 3 friends, or upload it to your Story (sharing 3× to our account is allowed; for Story, a screenshot once it is live is enough)</li>
            <li>Follow, like, comment, and subscribe must be maintained for at least 7 days (1 week). If you are found to have stopped earlier, the cashback cannot be disbursed.</li>
            <li>Attach screenshots as proof for each step</li>
            <li>Fill in the data correctly and completely</li>
          </ol>

          <p className="font-semibold text-gray-700">9.3 Cashback Amounts</p>
          <p>Refer to the cashback table on the homepage or claim page for current cashback rates per package.</p>

          <p className="font-semibold text-gray-700 mt-3">9.4 Claim Process</p>
          <ol className="list-decimal list-inside pl-2 space-y-1 mb-3">
            <li>Customer fulfills requirements in clause 9.2</li>
            <li>Customer fills in the cashback claim form</li>
            <li>Admin verifies proof within a maximum of 1x24 hours</li>
            <li>If valid → status set to Approved</li>
            <li>Payout is processed no earlier than 7 days after the key is activated (subject to the 9.2 maintenance requirements being met)</li>
            <li>Cashback is transferred via WhatsApp → status set to Paid</li>
            <li>If proof is invalid → Rejected</li>
          </ol>

          <p className="font-semibold text-gray-700">9.5 Penalties & Blacklist</p>
          <p>Customers found to be committing fraud (including: fake accounts, bots, duplicate claims, using the same post for repeated claims, or stopping follow/subscribe/like/comment before the required 7 days):</p>
          <ul className="list-disc list-inside pl-2 space-y-1 mb-3">
            <li>Cashback claim permanently rejected</li>
            <li>Blacklisted & unable to purchase new keys</li>
            <li>Active keys may be revoked without refund</li>
          </ul>

          <p className="font-semibold text-gray-700">9.6 Other Terms</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Cashback cannot be transferred to another number.</li>
            <li>Incorrect WhatsApp number during registration is not the responsibility of the Admin.</li>
            <li>Admin decisions are final.</li>
            <li>Terms & conditions may change at any time.</li>
          </ul>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 6)</p>
        </Section>

        <Section title="10. Personal Data">
          <p>10.1 Customer data (name, WhatsApp number, email) is used only for activation and support purposes.</p>
          <p>10.2 Data is not shared with third parties.</p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>11.1 The software is provided &quot;as is&quot; without any warranty.</p>
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

        <Section title="12. Intellectual Property Rights">
          <p>12.1 All copyright, ownership, and intellectual property rights to this software remain with the developer (MineClip Studio).</p>
          <p>12.2 This license does not grant ownership of the source code, algorithms, or technology used.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 4)</p>
        </Section>

        <Section title="13. License Termination">
          <p>The license terminates automatically if:</p>
          <p>13.1 The rental period expires.</p>
          <p>13.2 The customer violates the terms of the EULA.</p>
          <p>13.3 The developer decides to discontinue the service.</p>
          <p>Upon termination, the customer must delete all copies of the software.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 7)</p>
        </Section>

        <Section title="14. Governing Law">
          <p>14.1 This agreement is governed by the laws of the Republic of Indonesia.</p>
          <p>14.2 Disputes shall first be resolved through deliberation.</p>
          <p>14.3 If no agreement is reached, disputes shall be settled in the competent District Court.</p>
          <p className="text-gray-400 text-xs mt-2">(EULA Article 8)</p>
        </Section>
      </div>

      <div className="text-center mt-8">
        <Link href="/beli" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
          &larr; Kembali ke pembelian
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
        {title}
      </h2>
      <div className="space-y-2 pl-1">
        {children}
      </div>
    </div>
  );
}
