import { FileText } from "lucide-react";
import Link from "next/link";
import { TIERS, formatRupiah } from "@/lib/tiers";

const TIKTOK_URL = "https://www.tiktok.com/@mineclipstudios";
const YOUTUBE_URL = "https://www.youtube.com/@Mineclips_collection";
const WHATSAPP_URL = "https://wa.me/6282395912267";

const TOC_PART1: [string, string][] = [
  ["1", "One-Time Purchase Product"],
  ["2", "Packages & Pricing"],
  ["3", "Activation & License Key"],
  ["4", "Payment Methods"],
  ["5", "No Refund Policy"],
  ["6", "Prohibited Uses"],
  ["7", "Rights & Obligations"],
  ["8", "Warranty & Limitation of Liability"],
  ["9", "Intellectual Property Rights"],
  ["10", "Termination"],
  ["11", "Governing Law"],
  ["12", "Cashback Terms"],
  ["13", "Copyright & IP Notice"],
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
        <h1 className="text-xl font-bold text-gray-900">Terms &amp; Conditions and Privacy Policy</h1>
        <p className="text-sm text-gray-500 mt-1">MineClip Studios — Terms of Service, License Agreement, and Privacy Policy</p>
        <span className="inline-block mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200/50 tracking-widest">
          VERSION 2.1 · EFFECTIVE AUGUST 18, 2026
        </span>
      </div>

      <div className="card-lg space-y-8 text-sm text-gray-600 leading-relaxed">
        {/* ─── PART 1 ─── */}
        <PartTitle num="PART 1" title="Terms & Conditions" />
        <Toc items={TOC_PART1} group="s1" />

        <Section num="1" title="One-Time Purchase Product" group="s1">
          <p>1.1 MineClip Studios is sold as a <strong className="text-gray-700">one-time, permanent purchase</strong>. Pay once, and the license lasts forever — it is not a subscription or a rental.</p>
          <p>1.2 The license is <strong className="text-gray-700">non-exclusive and non-transferable</strong>. It is bound to a single device (Machine ID) and cannot be moved to another device without written permission from the developer.</p>
          <p>1.3 The license key and application are delivered once payment is confirmed. Both are digital products delivered by email or WhatsApp.</p>
          <p>1.4 Prices already include VAT (if applicable) and may change at any time. Purchases are subject to the price in effect at the time of the transaction.</p>
        </Section>

        <Section num="2" title="Packages & Pricing" group="s1">
          <p>2.1 The following 2 (two) one-time purchase packages are currently available:</p>
          <div className="overflow-x-auto my-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left font-semibold text-gray-700 py-2">Package</th>
                  <th className="text-right font-semibold text-gray-700 py-2">Original Price</th>
                  <th className="text-right font-semibold text-gray-700 py-2">Sale Price</th>
                  <th className="text-right font-semibold text-gray-700 py-2">Cashback</th>
                </tr>
              </thead>
              <tbody>
                {TIERS.map((t) => (
                  <tr key={t.value} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-900">
                      {t.label}
                      {t.value === "permanent_1080" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold">1080p</span>}
                    </td>
                    <td className="py-2 text-right text-gray-400 line-through">{formatRupiah(t.originalAmount)}</td>
                    <td className="py-2 text-right font-semibold text-emerald-600">{formatRupiah(t.amount)}</td>
                    <td className="py-2 text-right font-semibold text-amber-700">{formatRupiah(TIER_CASHBACK[t.value] || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>2.2 Promotional prices are limited-time and may change at any time without prior notice. The price in effect is the price shown at the time of the transaction.</p>
          <p>2.3 The package list and cashback amounts may be updated by the developer through the admin page; the terms of this document follow the latest applicable list.</p>
        </Section>

        <Section num="3" title="Activation & License Key" group="s1">
          <p>3.1 Once payment is confirmed, the license key and application are sent by email or WhatsApp according to the details provided at the time of purchase.</p>
          <p>3.2 Each license key is bound to a specific Machine ID and cannot be used on another device without written permission from the developer.</p>
          <p>3.3 The customer is responsible for keeping the license key confidential. Sharing the key with third parties is a violation that may result in the license being revoked without a refund.</p>
        </Section>

        <Section num="4" title="Payment Methods" group="s1">
          <p>4.1 Payment is processed via QRIS or bank transfer, according to the method chosen by the customer.</p>
          <p>4.2 After a successful payment, the system automatically generates the license key and the unique cashback code (if the package is eligible).</p>
          <p>4.3 The key, the application, and the unique cashback code are delivered by email or WhatsApp.</p>
          <p>4.4 If the payment received is <strong className="text-gray-700">less than the requested amount</strong>, the customer must choose one of the following options within the applicable period: <strong className="text-gray-700">(a)</strong> submit a refund request and have the transferred amount returned to the sender's account within a maximum of 1x24 hours (bank transfer fees are the customer's responsibility), or <strong className="text-gray-700">(b)</strong> pay the remaining balance through a supplementary payment (QRIS). A supplementary payment that is settled is automatically applied to the original order and is only processed once the full amount has been paid.</p>
        </Section>

        <Section num="5" title="No Refund Policy" group="s1">
          <p>5.1 All license purchases are final and non-refundable.</p>
          <p>5.2 The license is a digital product delivered immediately after payment, and therefore cannot be returned.</p>
          <p>5.3 No refund is provided when access is revoked because of a violation of the terms.</p>
          <p>5.4 By making a purchase, the customer agrees to and expressly waives any right to a refund.</p>
          <p>5.5 Refunds are only possible in cases where the payment received is less than the requested amount and the customer expressly requests a refund (see clause 4.4). The refund is transferred to the sender's account within a maximum of 1x24 hours, in the exact amount transferred (bank transfer fees are deducted and remain the customer's responsibility). Refunds already approved or processed by the Admin are final and cannot be withdrawn. Once an order has been approved by the Admin (status <strong className="text-gray-700">Paid</strong>), it is non-refundable.</p>
        </Section>

        <Section num="6" title="Prohibited Uses" group="s1">
          <p>The customer is strictly prohibited from:</p>
          <p>6.1 Reverse engineering the licensing system or the software.</p>
          <p>6.2 Using third-party tools to bypass or manipulate the license.</p>
          <p>6.3 Sharing, selling, or distributing the license key to third parties.</p>
          <p>6.4 Using the software for unlawful activities, including downloading copyright-infringing content.</p>
        </Section>

        <Section num="7" title="Rights & Obligations" group="s1">
          <p>7.1 The developer is entitled to update, fix, or discontinue certain software features at any time for the improvement of the service.</p>
          <p>7.2 The customer is entitled to software updates for as long as the license is active.</p>
          <p>7.3 The customer must provide accurate and complete information when purchasing and when claiming cashback.</p>
        </Section>

        <Section num="8" title="Warranty & Limitation of Liability" group="s1">
          <p>8.1 The software is provided "as is" without any warranty.</p>
          <p>8.2 The developer is not liable for:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Direct, indirect, incidental, or consequential damages</li>
            <li>Loss of data or revenue</li>
            <li>Business interruption arising from the use of this software</li>
            <li>Third-party claims</li>
          </ul>
          <p>8.3 The developer does not warrant that the software is free of errors (bugs) or that it will operate without interruption.</p>
        </Section>

        <Section num="9" title="Intellectual Property Rights" group="s1">
          <p>9.1 All copyright, ownership, and intellectual property rights in this software remain with the developer (MineClip Studios).</p>
          <p>9.2 This license does not grant ownership of the source code, algorithms, or technologies used.</p>
        </Section>

        <Section num="10" title="Termination" group="s1">
          <p>The license ends automatically when:</p>
          <p>10.1 The customer violates the terms set out in this document.</p>
          <p>10.2 The developer decides to discontinue the service.</p>
          <p>Upon termination, the customer must delete all copies of the software.</p>
        </Section>

        <Section num="11" title="Governing Law" group="s1">
          <p>11.1 This agreement is governed by the laws of the Republic of Indonesia.</p>
          <p>11.2 Disputes are first resolved through deliberation in order to reach mutual agreement.</p>
          <p>11.3 If no agreement is reached, the dispute is settled in the competent District Court (Pengadilan Negeri).</p>
        </Section>

        <Section num="12" title="Cashback Terms" group="s1">
          <p className="font-semibold text-gray-700">12.1 General Terms</p>
          <ul className="list-disc list-inside pl-2 space-y-1 mb-3">
            <li>Cashback only applies to purchases with the status Cashback Eligible (the amount per package is listed in the table in clause 2.1).</li>
            <li>Cashback is non-cash and is transferred to the registered WhatsApp number or email.</li>
            <li>Cashback can only be claimed once per key.</li>
            <li>Cashback cannot be combined with other promotions.</li>
          </ul>

          <p className="font-semibold text-gray-700">12.2 Claim Requirements</p>
          <ol className="list-decimal list-inside pl-2 space-y-1 mb-3">
            <li>
              Support us by following{" "}
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-semibold underline underline-offset-2 hover:text-violet-700">
                TikTok @mineclipstudios
              </a>{" "}
              or subscribing to{" "}
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-semibold underline underline-offset-2 hover:text-violet-700">
                YouTube @Mineclips_collection
              </a>
            </li>
            <li>Like &amp; comment on at least 3 posts — on TikTok or YouTube. Each claim requires different posts; reusing the same posts is considered invalid.</li>
            <li>Share the video with at least 3 friends or upload it to your Story (you may share 3 times to our account; for Story, a screenshot once it is published is enough).</li>
            <li>Follows, likes, comments, and subscriptions must be maintained for at least 7 days. If detected stopping earlier, the cashback cannot be paid out.</li>
            <li>Attach a screenshot as proof of each step.</li>
            <li>Fill in the data correctly and completely — it must match the purchase details for tracking purposes.</li>
          </ol>

          <p className="font-semibold text-gray-700">12.3 Claim Process</p>
          <ol className="list-decimal list-inside pl-2 space-y-1 mb-3">
            <li>The customer meets the requirements in clause 12.2.</li>
            <li>The customer fills out the cashback claim form on the claim page.</li>
            <li>The admin verifies the proof within a maximum of 1x24 hours.</li>
            <li>If valid → status Approved.</li>
            <li>Payout is processed at a minimum of 5 and a maximum of 7 days after the key is activated. Proof of transfer is sent to the registered WhatsApp number or email.</li>
            <li>If the proof is invalid → rejected (Rejected).</li>
          </ol>

          <p className="font-semibold text-gray-700">12.4 Sanctions &amp; Blacklist</p>
          <p>Customers proven to have committed fraud (including: fake accounts, bots, duplicate claims, reusing the same posts for repeated claims, or stopping follows/likes/subscriptions within the 7-day period):</p>
          <ul className="list-disc list-inside pl-2 space-y-1 mb-3">
            <li>Cashback claims are permanently rejected</li>
            <li>Blacklisted &amp; unable to purchase new keys</li>
            <li>Active keys may be revoked without a refund</li>
          </ul>

          <p className="font-semibold text-gray-700">12.5 Other Terms</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Cashback cannot be transferred to another number.</li>
            <li>A wrong WhatsApp number entered at registration is not the responsibility of the Admin.</li>
            <li>The Admin's decision is final.</li>
          </ul>
        </Section>

        <Section num="13" title="Copyright & IP Notice" group="s1">
          <p>13.1 <strong className="text-gray-700">YouTube</strong> is a trademark owned by Google LLC. MineClip Studios is an independent software product and is <strong className="text-gray-700">not affiliated with, endorsed by, or sponsored by</strong> Google LLC or YouTube.</p>
          <p>13.2 The software provides tools to download, transcribe, and edit video. The customer is solely responsible for ensuring that any video they download, transcribe, or edit is used in compliance with applicable copyright laws, YouTube's Terms of Service, and the rights of the original content owner.</p>
          <p>13.3 The customer may only download, transcribe, or edit content that they own, have licensed, or are otherwise legally permitted to use. The developer is not responsible for how the customer uses the software.</p>
          <p>13.4 This software is provided for personal and licensed use. Any other use — including unauthorized downloading, redistribution, or commercial misuse of third-party content — is the sole responsibility of the customer.</p>
          <p>13.5 If you believe that content processed through this software infringes your copyright, you may submit a takedown notice to the Admin via{" "}
            <a href="mailto:mineclipstudios@gmail.com" className="text-violet-600 font-medium underline underline-offset-2 hover:text-violet-700">mineclipstudios@gmail.com</a>{" "}
            or WhatsApp <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-medium underline underline-offset-2 hover:text-violet-700">+62 823-9591-2267</a>. Please include a description of the material, its location, and proof that you are the rights holder or are authorized to act on their behalf. We will review the request and respond within a reasonable time.</p>
          <p>13.6 Trademarks, logos, and brand names used on this website and in the software that are not owned by the developer remain the property of their respective owners and are used for identification or description only.</p>
        </Section>

        {/* ─── PART 2 ─── */}
        <div id="privacy-policy">
          <PartTitle num="PART 2" title="Privacy Policy" />
          <Toc items={TOC_PART2} group="s2" />
        </div>

        <p>
          This Privacy Policy explains how <strong className="text-gray-700">MineClip Studios</strong> ("we", "us", "our") collects, uses, stores, and protects your personal data when you use MineClip Studios, purchase a license, or claim cashback. By using our software and services, you agree to the practices described in this policy. This Privacy Policy is an integral part of our <strong className="text-gray-700">Terms &amp; Conditions</strong>.
        </p>

        <Section num="1" title="Data We Collect" group="s2">
          <p>We collect the following personal data from customers:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong className="text-gray-700">Name</strong> — filled in on the purchase form.</li>
            <li><strong className="text-gray-700">WhatsApp number</strong> — for key delivery, confirmation, and cashback transfers.</li>
            <li><strong className="text-gray-700">Email address</strong> — for sending invoices &amp; purchase confirmations.</li>
            <li><strong className="text-gray-700">Machine ID</strong> — used to bind the license key to a specific device.</li>
            <li><strong className="text-gray-700">Payment proof</strong> (transfer screenshot/photo) — for payment verification.</li>
            <li><strong className="text-gray-700">Cashback proof</strong> (screenshots of follows, likes, comments, shares) — for cashback claim verification.</li>
          </ul>
        </Section>

        <Section num="2" title="How We Use Your Data" group="s2">
          <p>Your personal data is used only for the following purposes:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>License activation and validation.</li>
            <li>Payment verification and order processing.</li>
            <li>Processing and verifying cashback claims.</li>
            <li>Customer support and communication.</li>
            <li>Security — detecting and preventing license misuse or fraud.</li>
          </ul>
          <p>We do not use your data for any other purpose without your consent.</p>
        </Section>

        <Section num="3" title="Legal Basis & Consent" group="s2">
          <p>We process your personal data based on your explicit consent, which you provide by checking the "I agree to the Terms &amp; Conditions" box at purchase, as well as by submitting data through our forms. This processing is carried out in accordance with Law of the Republic of Indonesia Number 27 of 2022 on Personal Data Protection (UU PDP).</p>
          <p>By proceeding with a purchase or a cashback claim, you confirm that you have read, understood, and agree to this Privacy Policy and these Terms &amp; Conditions.</p>
        </Section>

        <Section num="4" title="Storage & Security" group="s2">
          <p>Your personal data is stored in the developer's administrative database. Access is limited to the developer only and used exclusively for the purposes described in this policy.</p>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 leading-relaxed">
            <strong>Notice:</strong> Your data is not encrypted at the application level. Please avoid sending sensitive information beyond what our forms request.
          </div>
        </Section>

        <Section num="5" title="Data Sharing" group="s2">
          <p>We <strong className="text-gray-700">do not</strong> sell, rent, trade, or share your personal data with third parties for marketing or other commercial purposes.</p>
          <p>The only exceptions are:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>When disclosure is required by applicable Indonesian law or upon a legitimate request from competent authorities.</li>
            <li>When necessary to protect our legal rights (for example, taking action against license misuse or fraud).</li>
          </ul>
        </Section>

        <Section num="6" title="Data Retention" group="s2">
          <p>We retain your personal data for as long as you hold an active license or for as long as required by applicable law. If you request deletion, we will delete your data within a reasonable period, while remaining subject to legal obligations to retain it (for example, for ongoing fraud investigations or disputes).</p>
        </Section>

        <Section num="7" title="Your Rights" group="s2">
          <p>In accordance with applicable data protection regulations, you have the right to:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong className="text-gray-700">Access</strong> — request a copy of the personal data we hold about you.</li>
            <li><strong className="text-gray-700">Rectify</strong> — request that inaccurate data be corrected.</li>
            <li><strong className="text-gray-700">Erase</strong> — request the deletion of your personal data.</li>
            <li><strong className="text-gray-700">Withdraw consent</strong> — object to the processing of your data.</li>
          </ul>
          <p>To exercise these rights, contact the Admin using the details below. We will respond within a reasonable period.</p>
        </Section>

        <Section num="8" title="Contact Us" group="s2">
          <p>If you have any questions about this Privacy Policy, or wish to exercise your rights, contact us through:</p>
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
          <strong>By using MineClip Studios, you acknowledge that you have read, understood, and agree to all of these Terms &amp; Conditions and this Privacy Policy.</strong>
        </div>
      </div>

      <div className="text-center mt-8 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400">MineClip Studios — Terms &amp; Conditions and Privacy Policy</p>
        <p className="text-xs text-gray-500 mt-1">
          <strong className="text-gray-600">MineClip Studios</strong> | Version 2.1 | Effective August 18, 2026
        </p>
      </div>

      <div className="text-center mt-8">
        <Link href="/beli" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
          &larr; Back to purchase
        </Link>
      </div>
    </div>
  );
}

const TIER_CASHBACK: Record<string, number> = {
  permanent_720: 45000,
  permanent_1080: 50000,
};

function PartTitle({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gray-900 text-white rounded-lg text-xs font-bold tracking-wide">{num}</span>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function Toc({ items, group }: { items: [string, string][]; group: string }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs">
      <p className="font-bold text-gray-700 mb-2 uppercase tracking-wider text-[11px]">Table of Contents</p>
      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 list-none">
        {items.map(([num, label]) => (
          <li key={num}>
            <a
              href={`#${group}-${num}`}
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

function Section({ num, title, group, children }: { num: string; title: string; group: string; children: React.ReactNode }) {
  return (
    <div id={`${group}-${num}`}>
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
