'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const rules = [
  { title: 'The Password Rule', quote: '“Your password is not your birthday, Jim. Hackers have Google too.”', tip: 'Use long, unique passwords for every account.', image: '/images/tip-01-dwight-password.png', alt: 'Dwight gives a stern look about password security.' },
  { title: 'The Phishing Rule', quote: '“If an email says you’ve won a million dollars, you haven’t. Michael barely pays for lunch.”', tip: 'Verify the sender and inspect links before clicking.', image: '/images/tip-02-dwight-phishing.png', alt: 'Dwight points while warning about suspicious messages.' },
  { title: 'The MFA Rule', quote: '“One password? That’s like having one lock on the entire office. Bold strategy.”', tip: 'Enable multi-factor authentication wherever possible.', image: '/images/tip-03-jim-mfa.png', alt: 'Jim gives a knowing look about adding another layer of account security.' },
  { title: 'The Public Wi-Fi Rule', quote: '“Michael connected to free airport Wi-Fi. Now his laptop has more friends than he does.”', tip: 'Avoid sensitive transactions on untrusted networks; use a trusted VPN when appropriate.', image: '/images/tip-04-michael-wifi.png', alt: 'Michael reacts to the risks of public Wi-Fi.' },
  { title: 'The USB Rule', quote: '“Found a USB drive in the parking lot? Congratulations. You found a potential security incident.”', tip: 'Never plug in unknown USB devices.', image: '/images/tip-05-dwight-usb.png', alt: 'Dwight examines a document with suspicion.' },
  { title: 'The Software Update Rule', quote: '“Stanley ignores updates. Stanley also ignores Michael. One of these is a security risk.”', tip: 'Install security updates promptly.', image: '/images/tip-06-stanley-updates.png', alt: 'Stanley looks unimpressed by the idea of putting off updates.' },
  { title: 'The Privacy Rule', quote: '“Pam wouldn’t hand out everyone’s office keys. So why are you sharing personal information online?”', tip: 'Limit the personal information you share publicly.', image: '/images/tip-07-pam-privacy.png', alt: 'Pam at the reception desk, keeping watch over the office.' },
  { title: 'The Backup Rule', quote: '“Kevin deleted the spreadsheet. Again. Please tell me someone made a backup.”', tip: 'Keep regular backups and test that they can be restored.', image: '/images/tip-08-kevin-backups.png', alt: 'Kevin smiles from his desk after the spreadsheet mishap.' },
  { title: 'The Encryption Rule', quote: '“Oscar says sensitive data should be encrypted. Michael says he has nothing to hide. Oscar is right.”', tip: 'Encrypt sensitive data at rest and in transit.', image: '/images/tip-09-oscar-encryption.png', alt: 'Oscar considers how to protect sensitive information.' },
  { title: 'The Social Engineering Rule', quote: '“Someone claiming to be IT asks for your password? That’s not IT, Jim. That’s a trap.”', tip: 'Never share passwords or verification codes, even with someone claiming to be support.', image: '/images/tip-10-jim-social-engineering.png', alt: 'Jim gives a skeptical look at a suspicious request.' },
];

const michaelMemos = [
  '“I declare this email… PHISHING!”',
  '“Security is what she said. Wait, that’s not right.”',
  '“You miss 100% of the links you don’t click. — Michael Scott. Actually, please don’t click suspicious links.”',
  '“Limitless paper in a paperless world. Limitless passwords in a password manager.”',
  '“I am Beyoncé, always. But your account should never be logged in as someone else.”',
];

export function SecurityTips() {
  const [memo, setMemo] = useState(0);
  return <section className="section security-tips-section" id="security-tips" aria-labelledby="security-tips-title">
    <div className="wrap">
      <header className="security-tips-header">
        <div className="eyebrow">The Schrute survival manual</div>
        <h3 id="security-tips-title">Scranton’s cybersecurity rules</h3>
        <p>Ten rules for keeping the office, your accounts, and your data out of trouble.</p>
      </header>
      <div className="security-tip-list">
        {rules.map((rule, index) => <motion.article className="security-tip paper-card" key={rule.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
          <div className="security-tip-image"><Image src={rule.image} alt={rule.alt} width={600} height={450} loading="lazy" decoding="async" sizes="(max-width: 700px) 88vw, 320px" /></div>
          <div className="security-tip-copy">
            <div className="security-rule-kicker"><span>{String(index + 1).padStart(2, '0')}</span><span>SCRANTON’S RULE</span></div>
            <h4>{rule.title}</h4>
            <blockquote>{rule.quote}</blockquote>
            <p className="tip-practical"><strong>THE PRACTICAL PART</strong><br />{rule.tip}</p>
          </div>
        </motion.article>)}
      </div>
      <aside className="michael-bonus" aria-live="polite">
        <div><div className="eyebrow">A memo from Michael</div><p>{michaelMemos[memo]}</p></div>
        <button type="button" onClick={() => setMemo((memo + 1) % michaelMemos.length)} aria-label="Show the next Michael security memo">Next memo <ArrowRight size={15} /></button>
      </aside>
    </div>
  </section>;
}
