/** Frozen FAQ copy from seo-copy-freeze / faq-schema.md. Do not rewrite answers. */
export type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

export type FaqGroup = {
  heading: string;
  items: FaqItem[];
};

export const FAQ_GROUPS: FaqGroup[] = [
  {
    "heading": "Getting started",
    "items": [
      {
        "id": 1,
        "question": "Do I need an account to convert text to handwriting?",
        "answer": "No. You can paste text in this free online editor, preview a page, and download a PDF or PNG without signing in. An account is needed to keep your monthly quota across days or subscribe to Pro. Saved export history is not currently provided."
      },
      {
        "id": 2,
        "question": "How does the text to handwriting converter work?",
        "answer": "You paste or type text, choose a handwriting style and paper, preview the page in this online editor, and download PDF or PNG. You can also set margins, line spacing, ink colour, and optional natural variation for appearance."
      },
      {
        "id": 3,
        "question": "What can I use Writey for?",
        "answer": "Writey is for personal notes, revision, letters, journals, accessibility needs, and teacher or classroom examples. It is not positioned for submitting generated pages as handwritten school work when that would break your institution’s rules. Read Acceptable Use before you export."
      },
      {
        "id": 4,
        "question": "Is Writey a text to handwriting ai model that writes like a person?",
        "answer": "No. Writey is a typography tool: you type or paste text, choose a handwriting-style font and paper, preview the page in this free online editor, and export PDF or PNG. People often search for text to handwriting ai for this job. Writey does not clone a person’s handwriting and does not use a generative model that writes like a human. “AI handwriting generator” may appear in similar searches; it is a secondary synonym, not our product name, and we do not call Writey an AI handwriting generator."
      }
    ]
  },
  {
    "heading": "Languages",
    "items": [
      {
        "id": 5,
        "question": "Can I convert Hindi text as well as English?",
        "answer": "Yes. The editor supports English and Hindi (Devanagari) for preview and PDF or PNG export. See the Hindi support page for a focused walkthrough."
      },
      {
        "id": 6,
        "question": "Is the website available in Hindi?",
        "answer": "No. The interface is in English. Hindi is supported for input, preview, and export, not as a full Hindi interface."
      },
      {
        "id": 7,
        "question": "Does Writey support other Indian languages?",
        "answer": "No. Languages beyond English and Hindi are not included. They may be considered later and are not sold as a current add-on."
      }
    ]
  },
  {
    "heading": "Exports",
    "items": [
      {
        "id": 8,
        "question": "What file formats can I download?",
        "answer": "You can download PDF or PNG. This free online tool includes both formats on Free and Pro. Export quality and watermark rules depend on your plan."
      },
      {
        "id": 9,
        "question": "Do Free exports have a watermark?",
        "answer": "Yes. Free exports include a visible brand watermark that does not cover your text. This is an ordinary brand watermark, not a scan-disguise effect. Pro exports have no watermark."
      },
      {
        "id": 10,
        "question": "Do you keep the text I paste?",
        "answer": "We do not keep your source text as a long-term archive. If an export is processed on a server, the text is handled only as needed to complete the task and is not written into analytics logs. Exact retention of short-lived files is described in the Privacy Policy."
      },
      {
        "id": 11,
        "question": "How long can I re-download a file?",
        "answer": "Saved export history is not currently provided. In the current product, PDF and PNG files download in your browser and are not kept in an account history you can reopen later. Download again from the editor if you still have the text open."
      }
    ]
  },
  {
    "heading": "Accounts and limits",
    "items": [
      {
        "id": 12,
        "question": "What are the Free plan limits?",
        "answer": "Free includes 11 basic styles, including usable Latin and Devanagari handwriting styles. Free is $0 and allows up to 8 export pages per calendar month, with a watermark and standard quality. Daily preview and per-job caps also apply. The core path works without an account."
      },
      {
        "id": 13,
        "question": "What are the Pro plan limits?",
        "answer": "Pro includes all 15 licensed styles (the 11 Free styles plus 4 Pro styles). Pro is $3.99 per month or $39 per year, in USD, and allows up to 150 export pages per calendar month, with no watermark and higher export quality. Daily preview and per-job caps still apply. Payments are not open yet."
      },
      {
        "id": 14,
        "question": "What happens when I reach my page cap?",
        "answer": "You can still open the editor and edit your text, but a new export that would exceed the cap is refused. You can wait for the quota to reset, or upgrade to Pro if you are on Free. We do not sell an add-on pack."
      },
      {
        "id": 15,
        "question": "Are previews unlimited if I upgrade?",
        "answer": "No. Pro raises the daily preview cap; it does not remove the cap. After you reach the daily preview limit, you can keep editing and wait until the next reset."
      },
      {
        "id": 16,
        "question": "Why do I need an account for Pro?",
        "answer": "An account is required so we can bill the subscription and apply your quota. Guest use remains available on Free for the first useful preview and export. Saved export history is not currently provided."
      }
    ]
  },
  {
    "heading": "Acceptable use",
    "items": [
      {
        "id": 17,
        "question": "Is it okay to submit these pages as handwritten school work?",
        "answer": "No, not if that would break your school or college rules. You are responsible for how you use anything you export. See Acceptable Use for allowed uses and academic integrity rules."
      },
      {
        "id": 18,
        "question": "Do you offer tools to make pages harder to detect?",
        "answer": "No. We will not build or sell features whose purpose is to evade teachers, OCR, or detection tools. Optional natural variation (tilt, ink pressure, slight drift) is for appearance only."
      },
      {
        "id": 19,
        "question": "Does Writey clone my handwriting?",
        "answer": "No. Writey does not clone your own handwriting. It uses licensed handwriting-style fonts. Handwriting cloning is not a feature or a paid add-on."
      }
    ]
  },
  {
    "heading": "Plans, payments, and refunds",
    "items": [
      {
        "id": 20,
        "question": "How much does Pro cost?",
        "answer": "Pro is $3.99 per month or $39 per year, in USD. Applicable taxes will be shown at checkout. Payments are not open yet."
      },
      {
        "id": 21,
        "question": "Is Pro unlimited?",
        "answer": "No. Pro has a monthly cap of 150 export pages, and previews have daily and per-job caps. Neither plan is unlimited."
      },
      {
        "id": 22,
        "question": "Can I buy a Lifetime plan or a Business plan?",
        "answer": "No. We do not sell a Lifetime plan. Business, Teams, or Education access, if shown, is waitlist or contact only and has no public price."
      },
      {
        "id": 23,
        "question": "How do payments and taxes work?",
        "answer": "Payments will be processed by a third-party provider, to be confirmed. We do not name a vendor as if it were already contracted, and we do not collect full card numbers or UPI secrets in Writey forms. Applicable taxes will be shown at checkout."
      },
      {
        "id": 24,
        "question": "What is your refund policy?",
        "answer": "Refund requests are handled under our Refund Policy. The commercial window is still being confirmed. This draft does not take away rights that applicable law says you cannot give up."
      },
      {
        "id": 25,
        "question": "How do I join the Teams or Education waitlist?",
        "answer": "Use the waitlist or contact form on the Pricing page, or email `support@text2handwriting.site`. This is a request to be contacted, not a purchase."
      }
    ]
  }
];

export const ALL_FAQ_ITEMS: FaqItem[] = FAQ_GROUPS.flatMap((group) => group.items);

export const HOME_FAQ_IDS = [1, 4, 5, 8, 17] as const;

/** Homepage excerpt uses Q1, Q4, Q5, Q8, Q17 from seo-copy-freeze §1.4 / landing-copy §8.13.
 *  Homepage wording is frozen separately in landing-copy and must not be replaced by a paraphrase.
 */
export const HOME_FAQ: FaqItem[] = [
  {
    id: 1,
    question: "Do I need an account to convert text to handwriting?",
    answer:
      "No. You can paste text in this free online editor, preview a page, and download a PDF or PNG without signing in. An account is needed to keep quota across days or subscribe to Pro. Saved export history is not currently provided.",
  },
  {
    id: 4,
    question: "Is Writey a text to handwriting ai model that writes like a person?",
    answer:
      "No. Writey is a typography tool: you type or paste text, choose a handwriting-style font and paper, preview the page in this free online editor, and export PDF or PNG. People often search for text to handwriting ai for this job. Writey does not clone a person’s handwriting and does not use a generative model that writes like a human.",
  },
  {
    id: 5,
    question: "Can I convert Hindi text as well as English?",
    answer:
      "Yes. The editor supports English and Hindi (Devanagari) for preview and PDF or PNG export.",
  },
  {
    id: 8,
    question: "What file formats can I download?",
    answer:
      "You can download PDF or PNG. This free online tool includes both formats on Free and Pro. Quality and watermark rules depend on your plan.",
  },
  {
    id: 17,
    question: "Is it okay to submit these pages as handwritten school work?",
    answer:
      "No, not if that would break your school or college rules. Writey is for personal notes, revision, letters, journals, accessibility needs, and teacher or classroom examples. See Acceptable Use.",
  },
];

export const HINDI_FAQ: FaqItem[] = [
  {
    id: 101,
    question: "Can I export Hindi pages without an account?",
    answer:
      "Yes. Guest users can preview and complete a useful Free export online, including Hindi text, and download PDF or PNG within plan limits.",
  },
  {
    id: 102,
    question: "Is the whole website in Hindi?",
    answer:
      "No. The interface is in English. Hindi is supported for input, preview, and export.",
  },
  {
    id: 103,
    question: "Is Hindi the main keyword for the whole site?",
    answer:
      "No. This page explains a supported language in the converter. The homepage keyword is text to handwriting ai.",
  },
];

export const PRICING_FAQ: FaqItem[] = [
  {
    id: 201,
    question: "Is Pro unlimited?",
    answer:
      "No. Pro allows up to 150 export pages per month, and previews have daily caps.",
  },
  {
    id: 202,
    question: "Do I need to pay to try Writey?",
    answer:
      "No. The Free plan is $0 and can complete a useful preview and export, with a watermark and monthly limits.",
  },
  {
    id: 203,
    question: "Can I buy a Lifetime plan?",
    answer: "No. We do not sell a Lifetime plan.",
  },
];
