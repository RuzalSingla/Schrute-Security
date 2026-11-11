export type Lesson = {
  title: string;
  explanation: string;
  example: string;
  question: string;
  options: string[];
  answer: number;
  feedback: string;
};

export type TrainingModule = {
  id: string;
  number: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  character: string;
  image: string;
  description: string;
  topics: string[];
  minutes: number;
  intro: string;
  lessons: Lesson[];
};

const lesson = (title: string, explanation: string, example: string, question: string, options: string[], answer: number, feedback: string): Lesson => ({ title, explanation, example, question, options, answer, feedback });

export const trainingModules: TrainingModule[] = [
  {
    id: 'dwight-orientation', number: '01', title: "Dwight's Security Orientation", level: 'Beginner', character: 'Dwight Schrute', image: '/images/training-dwight.png',
    description: 'Learn the basic language of security and how to protect the branch’s most important digital assets.', topics: ['Security basics', 'Assets and risk', 'CIA triad', 'Everyday hygiene'], minutes: 12,
    intro: 'Dwight has appointed you deputy assistant to the regional security administrator. Start by learning what needs protection, what can go wrong, and which safeguards actually help.',
    lessons: [
      lesson('What cybersecurity protects', 'Cybersecurity is the practice of protecting devices, accounts, networks, and information from unauthorized access, disruption, or damage. It combines people, processes, and technology.', 'The branch protects customer records, payroll, email accounts, and the shared printer system. Each is an asset with different security needs.', 'Which is a digital asset that should be protected?', ['Only company laptops', 'Customer records and the accounts that can access them', 'Only files marked confidential'], 1, 'Accounts and information are assets too, even when they are stored in cloud services rather than on a company laptop.'),
      lesson('Threats, vulnerabilities, and risk', 'A threat is something that could cause harm. A vulnerability is a weakness that could be exploited. Risk combines the likelihood of an event with its potential impact.', 'An outdated file server is vulnerable. A criminal group is a threat. The risk depends on exposure, safeguards, and the sensitivity of the files it holds.', 'A public folder is accidentally open to everyone. What is the open permission?', ['A threat actor', 'A vulnerability', 'A security incident'], 1, 'The overly broad permission is a weakness. It creates risk if someone accesses or misuses the exposed files.'),
      lesson('The CIA triad and daily habits', 'Confidentiality limits information to authorized people. Integrity helps keep it accurate and unaltered. Availability keeps it accessible when needed. Backups, access control, and verification support these goals.', 'Restricting payroll access supports confidentiality; checking a file signature supports integrity; maintaining tested backups supports availability.', 'A tested backup most directly supports which goal?', ['Availability', 'Confidentiality', 'Authentication'], 0, 'Recoverable backups help restore access after data loss or disruption, supporting availability.'),
    ],
  },
  {
    id: 'jim-phishing', number: '02', title: "Jim's Pranks or Phishing?", level: 'Beginner', character: 'Jim Halpert', image: '/images/training-jim.png',
    description: 'Spot messages that use urgency, impersonation, and tempting bait to get someone to act.', topics: ['Phishing', 'Spoofing', 'Social engineering', 'Safe verification'], minutes: 15,
    intro: 'Jim says this is “probably fine.” Dwight disagrees. Learn to slow down, inspect the message, and verify through a channel you already trust.',
    lessons: [
      lesson('How phishing works', 'Phishing messages impersonate a trusted person or service to get you to reveal information, open a harmful attachment, or visit a deceptive site. Some target a specific person or team.', 'An unexpected “Dunder Mifflin IT” message offers a gift card if you sign in immediately. The reward and urgency are designed to rush you.', 'A message asks you to sign in through an unfamiliar link to claim a reward. What is the safest first move?', ['Open it in a private browser window', 'Verify the sender and destination using a known channel', 'Forward it to coworkers to ask if it looks real'], 1, 'Independent verification helps confirm the request without interacting with the suspicious link.'),
      lesson('Read the sender and the link', 'Display names can be faked. Check the full sender address and inspect where a link actually leads before opening it. Unexpected file types and mismatched domains deserve extra caution.', 'A message displays “Help Desk” but comes from a misspelled external domain. The visible button text does not prove its destination is safe.', 'What matters most when evaluating a link?', ['Its color and button label', 'The actual destination domain', 'Whether the message includes your first name'], 1, 'The destination domain is a key clue. Personalization and visual polish are easy to imitate.'),
      lesson('Report and recover safely', 'Use your organization’s report-phishing process. If you clicked or entered credentials, report it promptly and follow the response process; do not hide the mistake or attempt risky cleanup yourself.', 'If a link opened a sign-in page and you entered your password, notify IT using the established contact method so they can secure the account.', 'You entered a password on a page that now seems suspicious. What next?', ['Report it promptly and follow your organization’s recovery steps', 'Delete the email and wait', 'Reply asking whether it was genuine'], 0, 'Fast reporting gives responders a chance to protect the account and check for further activity.'),
    ],
  },
  {
    id: 'angela-access', number: '03', title: "Angela's Access Control Policy", level: 'Beginner', character: 'Angela Martin', image: '/images/training-angela.png',
    description: 'Protect accounts with unique passwords, multi-factor authentication, and carefully limited access.', topics: ['Password managers', 'MFA', 'Authentication', 'Least privilege'], minutes: 14,
    intro: 'Angela maintains the access list. Her policy is simple: know who is asking, grant only what they need, and do not make one password responsible for the whole office.',
    lessons: [
      lesson('Unique passwords and password managers', 'Long, unique passwords reduce the damage from guessing and password reuse. A reputable password manager can create and store distinct credentials for each service.', 'If a shopping site is breached, a unique password prevents that exposed credential from directly unlocking your work account.', 'Why use a different password for each account?', ['It prevents one breach from automatically exposing other accounts', 'It makes passwords easier to remember', 'It replaces the need for MFA'], 0, 'Unique passwords limit credential-stuffing risk. MFA remains a valuable additional safeguard.'),
      lesson('MFA and account recovery', 'Multi-factor authentication uses additional proof beyond a password, such as a security key or authenticator approval. Never share one-time codes, and secure account recovery options.', 'A caller claiming to be IT asks for the code that just appeared on your phone. A real support process should not require you to disclose that code.', 'Someone claiming to be IT asks you to read out your sign-in code. What should you do?', ['Share it if they know your name', 'Do not share it; contact IT through a known channel', 'Send a screenshot instead'], 1, 'Verification codes can let someone complete a sign-in. Keep them private and report unusual requests.'),
      lesson('Authentication, authorization, and least privilege', 'Authentication verifies identity. Authorization determines what that identity may do. Least privilege gives each account only the permissions required for its role.', 'A new employee may need access to a shared schedule but not payroll records. Access should change when their job changes.', 'Which practice best reflects least privilege?', ['Give everyone administrator access for convenience', 'Grant access needed for a role and review it when duties change', 'Use one shared account for the whole department'], 1, 'Role-based, reviewed access limits how much damage a compromised or misused account can cause.'),
    ],
  },
  {
    id: 'oscar-malware', number: '04', title: "Oscar's Technical Briefing: Malware", level: 'Intermediate', character: 'Oscar Martinez', image: '/images/training-oscar.png',
    description: 'Understand common malware families and the practical controls that reduce their impact.', topics: ['Viruses and worms', 'Trojans', 'Ransomware', 'Prevention'], minutes: 18,
    intro: 'Oscar has prepared a technically accurate briefing. Malware is a broad category; recognizing how it arrives and spreads is more useful than memorizing dramatic names.',
    lessons: [
      lesson('Malware families', 'A virus attaches to a host file, a worm can spread between systems, and a Trojan disguises itself as legitimate software. Ransomware may encrypt or otherwise deny access to data.', 'A fake invoice attachment may disguise a Trojan installer. Once run, it could download other unwanted software.', 'Which description best fits a worm?', ['Malware that can spread between systems without attaching to a host file', 'A security update from a trusted vendor', 'A tool that encrypts every file for safe storage'], 0, 'Worms are known for self-propagation across systems or networks.'),
      lesson('Ransomware and layered defense', 'Ransomware can disrupt operations and threaten data exposure. Maintain isolated or protected backups, patch systems, restrict execution paths, and rehearse a response plan.', 'A backup connected with the same credentials and always writable may also be affected. Protected, tested recovery copies improve resilience.', 'Which measure most directly supports recovery after ransomware?', ['A tested backup protected from routine modification', 'Reusing the same administrator password', 'Turning off security alerts'], 0, 'Backups should be protected and tested so restoration is possible when systems are disrupted.'),
      lesson('Prevention and safe response', 'Keep operating systems and applications updated, use endpoint protection, limit privileges, and avoid unexpected downloads. Report suspicious behavior and follow the incident process.', 'If a workstation begins encrypting files, disconnecting it may be part of a response plan, but follow your organization’s instructions and contact responders immediately.', 'An unknown attachment triggers unexpected behavior. What is the best response?', ['Keep opening it to understand the issue', 'Stop interacting and report it through the established process', 'Install an unapproved cleanup tool'], 1, 'Avoid further interaction and let trained responders handle containment and investigation.'),
    ],
  },
  {
    id: 'stanley-network', number: '05', title: "Stanley's Network Security", level: 'Intermediate', character: 'Stanley Hudson', image: '/images/training-stanley.png',
    description: 'Learn the basics of network traffic, secure Wi-Fi, firewalls, and safer remote connections.', topics: ['IP and DNS', 'HTTPS', 'Firewalls', 'VPN and Wi-Fi'], minutes: 18,
    intro: 'Stanley would like to finish this before lunch. The essentials: know where traffic is going, use trusted networks, and limit what is allowed through.',
    lessons: [
      lesson('IP addresses, DNS, and web traffic', 'IP addresses identify network endpoints. DNS translates human-readable domain names into addresses. HTTPS encrypts a connection to a site and helps authenticate its domain.', 'A convincing page can still be a phishing page even when it uses HTTPS. Check the domain and the reason for the request.', 'What does DNS primarily do?', ['Translate domain names into network addresses', 'Encrypt every file on your computer', 'Grant a user administrator access'], 0, 'DNS helps systems locate services by resolving names to network addresses.'),
      lesson('Firewalls and network boundaries', 'Firewalls apply rules to network traffic. A secure configuration permits necessary communication and restricts what is not needed. Network segmentation can limit lateral movement.', 'A printer that needs to communicate with a print server does not necessarily need open access to every workstation.', 'What is a sensible firewall approach?', ['Allow all traffic by default', 'Permit necessary traffic and restrict the rest', 'Disable logging so the network runs faster'], 1, 'Restrictive rules reduce unnecessary exposure while preserving required services.'),
      lesson('Wi-Fi and remote work', 'Use trusted Wi-Fi with modern security settings. Avoid sensitive work on untrusted public networks unless your organization’s approved protections are in place. A VPN protects a connection to its endpoint but does not make every destination trustworthy.', 'On airport Wi-Fi, a lookalike captive portal may request credentials. Confirm network instructions with the venue and use company-approved remote access.', 'Does using a VPN guarantee that every website you visit is safe?', ['Yes, a VPN blocks all phishing', 'No; it protects a connection path but does not validate every site', 'Yes, if the Wi-Fi is public'], 1, 'A VPN is one control. You still need to verify sites, protect accounts, and follow policy.'),
    ],
  },
  {
    id: 'pam-privacy', number: '06', title: "Pam's Confidential Files", level: 'Intermediate', character: 'Pam Beesly', image: '/images/training-pam.png',
    description: 'Handle sensitive information carefully with classification, encryption, safe sharing, and backups.', topics: ['Privacy', 'Data classification', 'Encryption', 'Backups'], minutes: 17,
    intro: 'Pam knows where the important files are and who should see them. Learn to classify information, share it intentionally, and keep a safe route back if it is lost.',
    lessons: [
      lesson('Privacy and data classification', 'Collect and share only information needed for a legitimate purpose. Classification labels help people apply the right access, storage, and sharing rules to information.', 'A customer list should not be posted in a public collaboration space just because a link is convenient.', 'Before sharing a sensitive file, what should you check?', ['Whether the recipient is authorized and the sharing method is approved', 'Whether the filename looks professional', 'Whether a public link is faster'], 0, 'Confirm both the recipient and the channel. Convenience should not override access controls.'),
      lesson('Encryption and secure transfer', 'Encryption protects data by making it unreadable without the right key. Use approved encryption and transfer services. Digital signatures can help verify origin and integrity; hashes alone do not identify who made a file.', 'Encrypting a laptop protects stored data if the device is lost. A secure transfer channel protects data while it moves.', 'What does encryption primarily provide?', ['Confidentiality for data to authorized key holders', 'A guarantee that the file is accurate', 'A guarantee that its author is trustworthy'], 0, 'Encryption protects confidentiality. Integrity and identity require other mechanisms.'),
      lesson('Backups and recovery', 'Maintain regular backups that are protected from accidental deletion and malware. Test restoration so you know the copies work and the recovery process meets business needs.', 'A file sync service may replicate accidental deletion. A separate versioned backup can provide an additional recovery point.', 'Why test restoring from backups?', ['To confirm the data can actually be recovered when needed', 'To increase the number of duplicate files', 'To avoid applying security updates'], 0, 'A backup that cannot be restored is not a dependable recovery control.'),
    ],
  },
  {
    id: 'kevin-threat-feed', number: '07', title: "Kevin's Threat Feed", level: 'Advanced', character: 'Kevin Malone', image: '/images/training-kevin.png',
    description: 'Interpret threat intelligence and vulnerability information without confusing signals with confirmed incidents.', topics: ['Threat actors', 'IoCs', 'CVEs', 'Threat reports'], minutes: 22,
    intro: 'Kevin is watching the feed. Your job is to separate useful indicators from noise, check the context, and avoid treating an alert as proof of compromise.',
    lessons: [
      lesson('Threat intelligence in context', 'Threat intelligence is analyzed information about threats, adversaries, capabilities, and opportunities to improve decisions. Good intelligence includes context, confidence, relevance, and timeliness.', 'A report about a threat actor targeting hospitals may not apply directly to a paper company, but its techniques could still inform defensive monitoring.', 'What makes threat intelligence more actionable?', ['Context about relevance, confidence, and timeliness', 'A dramatic headline', 'An unverified screenshot without source details'], 0, 'Context helps teams decide whether and how to act on information.'),
      lesson('Indicators of compromise', 'IoCs are observable clues such as suspicious domains, file hashes, or network patterns. Indicators can become stale or be shared by benign services, so validate them and combine them with other evidence.', 'A malicious domain in a feed can guide a search of company logs, but its presence in a feed alone does not prove a user visited it.', 'An IoC appears in a public feed. What does that establish by itself?', ['That your organization was breached', 'A lead to investigate, with no proof of local impact by itself', 'That the indicator will remain reliable forever'], 1, 'An indicator is evidence to check, not conclusive proof of an incident at your organization.'),
      lesson('CVEs and vulnerability prioritization', 'A CVE is an identifier for a publicly disclosed vulnerability. Prioritization should consider exposure, exploitability, affected assets, business impact, and available mitigations—not the identifier alone.', 'A severe issue on an isolated test machine may be lower priority than an actively exploited flaw on an internet-facing server.', 'What should influence vulnerability priority?', ['Exposure and business impact along with severity and exploit status', 'The CVE number alone', 'The age of the security team'], 0, 'Prioritize based on risk to real assets and current exploitation evidence.'),
    ],
  },
  {
    id: 'michael-incident', number: '08', title: "Michael's Branch-Wide Security Incident", level: 'Advanced', character: 'Michael Scott', image: '/images/training-michael.png',
    description: 'Practice a calm incident-response sequence: detect, contain, preserve evidence, recover, and learn.', topics: ['Incident response', 'Containment', 'Evidence', 'Recovery'], minutes: 24,
    intro: 'Michael has called an all-hands meeting. Keep it orderly: use the response plan, preserve useful evidence, communicate through the right channels, and resist dramatic improvisation.',
    lessons: [
      lesson('Detect and report', 'Incident response starts with recognizing and reporting suspicious activity. Follow organizational escalation channels, record what you observed, and avoid altering evidence unnecessarily.', 'A user reports an unexpected MFA prompt. Record its time and context, then notify security using the established method.', 'What is useful when reporting suspicious activity?', ['A clear description, time, affected device or account, and actions taken', 'A guess about who is responsible', 'Deleting logs to reduce confusion'], 0, 'Specific observations help responders investigate while speculation and deletion can hinder them.'),
      lesson('Contain and preserve evidence', 'Responders may isolate affected systems or disable credentials to limit impact. Preserve logs and relevant artifacts according to policy. Do not power off, wipe, or modify systems unless responders direct it.', 'A suspected infected laptop may need network isolation, but the organization’s responders should direct containment and evidence handling.', 'You suspect a workstation is compromised. Which action is safest?', ['Follow the incident plan and contact responders promptly', 'Wipe it immediately', 'Post the details to a public forum'], 0, 'The response plan ensures appropriate containment while preserving evidence and protecting others.'),
      lesson('Recover and learn', 'Recovery restores services from trusted sources, validates systems, and monitors for recurrence. A post-incident review identifies improvements without blaming individuals for reporting in good faith.', 'After restoring a file server, verify the backup is clean, patch the initial weakness, and review access and monitoring.', 'What should happen after service restoration?', ['Validate recovery and review lessons to reduce recurrence', 'Assume the incident cannot happen again', 'Delete all records of the event'], 0, 'Validation and a blameless review improve resilience and future response.'),
    ],
  },
];

export const XP_REWARDS = { lesson: 25, quiz: 25, module: 100 } as const;
export const RANKS = [
  { name: 'The Temp', xp: 0 },
  { name: 'Sales Associate', xp: 250 },
  { name: 'IT Specialist', xp: 750 },
  { name: 'Assistant to the Regional Security Administrator', xp: 1500 },
  { name: 'Regional Security Manager', xp: 3000 },
] as const;
export const BADGES = [
  { id: 'first-lesson', name: 'Security Rookie', detail: 'Complete your first lesson.' },
  { id: 'phishing', name: "World's Best Phishing Detector", detail: 'Complete the phishing module.' },
  { id: 'accounts', name: 'Identity Protection Pro', detail: 'Complete the access-control module.' },
  { id: 'backup', name: 'Bears. Beets. Backups.', detail: 'Complete the confidential-files module.' },
  { id: 'threat', name: 'Threat Investigator', detail: 'Complete the threat-feed module.' },
  { id: 'dwight', name: 'Dwight Approved', detail: 'Complete all eight modules.' },
] as const;

export type TrainingProgress = { xp: number; completedLessons: string[]; passedQuizzes: string[]; completedModules: string[] };
export const EMPTY_PROGRESS: TrainingProgress = { xp: 0, completedLessons: [], passedQuizzes: [], completedModules: [] };
const STORAGE_KEY = 'schrute-security-training-v1';

export function loadProgress(): TrainingProgress {
  if (typeof window === 'undefined') return EMPTY_PROGRESS;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null') as Partial<TrainingProgress> | null;
    if (!parsed) return EMPTY_PROGRESS;
    return {
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      passedQuizzes: Array.isArray(parsed.passedQuizzes) ? parsed.passedQuizzes : [],
      completedModules: Array.isArray(parsed.completedModules) ? parsed.completedModules : [],
    };
  } catch { return EMPTY_PROGRESS; }
}

export function saveProgress(progress: TrainingProgress) {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function currentRank(xp: number) {
  let index = 0;
  RANKS.forEach((rank, i) => { if (xp >= rank.xp) index = i; });
  return { current: RANKS[index], next: RANKS[index + 1] || null };
}

