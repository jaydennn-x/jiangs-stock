#!/usr/bin/env python3
"""
Registry Section 컴포넌트 생성 스크립트
사용법:
  python3 scripts/create-registry-component.py \
    --name "example-com-hero-0" \
    --category "hero" \
    --image-path "scraped/example-com-2024-01-01/sections/section-0.png" \
    --keywords "hero, landing, cta" \
    --language "en" \
    --parent-page "example-com-landing" \
    --source-url "https://example.com" \
    --section-index 0 \
    --tags-functional "email-capture" \
    --tags-style "light-theme, modern" \
    --tags-layout "centered, full-width" \
    --tags-industry "saas"
"""

import argparse
import json
import os
import re
import sys
import base64
from pathlib import Path
from datetime import datetime

# ─── CLI 인자 파싱 ──────────────────────────────────────────────
def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--name", required=True, help="컴포넌트 이름 (예: example-com-hero-0)")
    p.add_argument("--category", required=True, help="섹션 카테고리")
    p.add_argument("--image-path", required=True, help="섹션 스크린샷 경로 (public/ 하위)")
    p.add_argument("--keywords", required=True, help="콤마 구분 키워드")
    p.add_argument("--language", required=True, choices=["en", "ko"], help="언어")
    p.add_argument("--parent-page", required=True, help="부모 페이지 이름")
    p.add_argument("--source-url", required=True, help="원본 URL")
    p.add_argument("--section-index", required=True, type=int)
    p.add_argument("--tags-functional", default="", help="기능 태그들")
    p.add_argument("--tags-style", default="", help="스타일 태그들")
    p.add_argument("--tags-layout", default="", help="레이아웃 태그들")
    p.add_argument("--tags-industry", default="", help="산업 태그들")
    return p.parse_args()


# ─── 이름 → PascalCase 변환 ────────────────────────────────────
def to_pascal_case(name: str) -> str:
    return "".join(part.capitalize() for part in re.split(r"[-_]", name))


# ─── 태그 파싱 ─────────────────────────────────────────────────
def parse_tags(raw: str) -> list[str]:
    return [t.strip() for t in raw.split(",") if t.strip()]


# ─── 카테고리별 기본 컴포넌트 템플릿 ──────────────────────────
def make_component(pascal_name: str, category: str, language: str, image_path: str) -> str:
    # 이미지 경로를 public 기준으로 변환
    img_public = image_path.replace("\\", "/")
    if not img_public.startswith("/"):
        img_public = "/" + img_public

    lang_comment = "// English content" if language == "en" else "// 한국어 콘텐츠"

    templates = {
        "header": f'''import {{ Button }} from "@/components/ui/button";

export default function {pascal_name}() {{
  {lang_comment}
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Logo</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Home</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button size="sm">Get Started</Button>
        </div>
      </div>
    </header>
  );
}}
''',
        "hero": f'''import {{ Button }} from "@/components/ui/button";

export default function {pascal_name}() {{
  {lang_comment}
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
          The Best Way to
          <span className="text-primary"> Build Faster</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Everything you need to launch your product. Start building today and
          ship in days, not months.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg">Get Started Free</Button>
          <Button size="lg" variant="outline">View Demo</Button>
        </div>
      </div>
    </section>
  );
}}
''',
        "feature": f'''export default function {pascal_name}() {{
  {lang_comment}
  const features = [
    {{ title: "Fast", description: "Built for speed and performance." }},
    {{ title: "Secure", description: "Enterprise-grade security built in." }},
    {{ title: "Scalable", description: "Grows with your business." }},
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {{features.map((f, i) => (
            <div key={{i}} className="rounded-xl border bg-background p-6 shadow-sm">
              <h3 className="mb-2 text-xl font-semibold">{{f.title}}</h3>
              <p className="text-muted-foreground">{{f.description}}</p>
            </div>
          ))}}
        </div>
      </div>
    </section>
  );
}}
''',
        "pricing": f'''import {{ Button }} from "@/components/ui/button";

export default function {pascal_name}() {{
  {lang_comment}
  const plans = [
    {{ name: "Starter", price: "$9", features: ["5 projects", "10GB storage", "Basic support"] }},
    {{ name: "Pro", price: "$29", features: ["Unlimited projects", "100GB storage", "Priority support"], popular: true }},
    {{ name: "Enterprise", price: "$99", features: ["Everything in Pro", "Custom integrations", "Dedicated support"] }},
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-center text-3xl font-bold">Simple Pricing</h2>
        <p className="mb-12 text-center text-muted-foreground">Choose the plan that works for you</p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {{plans.map((plan, i) => (
            <div key={{i}} className={{`rounded-xl border p-8 ${{plan.popular ? "border-primary shadow-lg ring-1 ring-primary" : "bg-background shadow-sm"}}`}}>
              {{plan.popular && <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">Popular</span>}}
              <h3 className="text-xl font-bold">{{plan.name}}</h3>
              <p className="mb-6 mt-2 text-4xl font-bold">{{plan.price}}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <ul className="mb-8 space-y-3">
                {{plan.features.map((f, j) => (
                  <li key={{j}} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">✓</span> {{f}}
                  </li>
                ))}}
              </ul>
              <Button className="w-full" variant={{plan.popular ? "default" : "outline"}}>Get Started</Button>
            </div>
          ))}}
        </div>
      </div>
    </section>
  );
}}
''',
        "testimonial": f'''export default function {pascal_name}() {{
  {lang_comment}
  const testimonials = [
    {{ name: "Sarah K.", role: "CEO at Startup", text: "This product changed how we work. Highly recommended!" }},
    {{ name: "James L.", role: "Product Manager", text: "Incredible time saver. Our team loves it." }},
    {{ name: "Amy W.", role: "Developer", text: "Best tool I've used in years. Worth every penny." }},
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold">What Our Customers Say</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {{testimonials.map((t, i) => (
            <div key={{i}} className="rounded-xl border bg-background p-6 shadow-sm">
              <p className="mb-4 text-muted-foreground">"{{t.text}}"</p>
              <div>
                <p className="font-semibold">{{t.name}}</p>
                <p className="text-sm text-muted-foreground">{{t.role}}</p>
              </div>
            </div>
          ))}}
        </div>
      </div>
    </section>
  );
}}
''',
        "cta": f'''import {{ Button }} from "@/components/ui/button";

export default function {pascal_name}() {{
  {lang_comment}
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
        <p className="mb-8 text-lg opacity-90">
          Join thousands of teams already using our platform.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" variant="secondary">Start Free Trial</Button>
          <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  );
}}
''',
        "faq": f'''import {{ useState }} from "react";

export default function {pascal_name}() {{
  {lang_comment}
  const faqs = [
    {{ q: "What is included in the free plan?", a: "The free plan includes up to 5 projects and 10GB of storage." }},
    {{ q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time with no questions asked." }},
    {{ q: "Do you offer a discount for nonprofits?", a: "Yes, we offer 50% discount for eligible nonprofit organizations." }},
    {{ q: "Is there a long-term contract?", a: "No, all plans are month-to-month. No long-term commitment required." }},
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-12 text-center text-3xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {{faqs.map((faq, i) => (
            <div key={{i}} className="rounded-xl border bg-background shadow-sm">
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left font-medium"
                onClick={{() => setOpen(open === i ? null : i)}}
              >
                {{faq.q}}
                <span className={{`transition-transform ${{open === i ? "rotate-180" : ""}}`}}>↓</span>
              </button>
              {{open === i && (
                <div className="px-6 pb-4 text-muted-foreground">{{faq.a}}</div>
              )}}
            </div>
          ))}}
        </div>
      </div>
    </section>
  );
}}
''',
        "footer": f'''export default function {pascal_name}() {{
  {lang_comment}
  return (
    <footer className="border-t bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Features</a></li>
              <li><a href="#" className="hover:text-foreground">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Docs</a></li>
              <li><a href="#" className="hover:text-foreground">Support</a></li>
              <li><a href="#" className="hover:text-foreground">Status</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {{new Date().getFullYear()}} Company. All rights reserved.
        </div>
      </div>
    </footer>
  );
}}
''',
        "stats": f'''export default function {pascal_name}() {{
  {lang_comment}
  const stats = [
    {{ label: "Active Users", value: "10K+" }},
    {{ label: "Projects Created", value: "50K+" }},
    {{ label: "Countries", value: "120+" }},
    {{ label: "Uptime", value: "99.9%" }},
  ];

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
          {{stats.map((s, i) => (
            <div key={{i}}>
              <p className="text-4xl font-bold">{{s.value}}</p>
              <p className="mt-1 text-sm opacity-80">{{s.label}}</p>
            </div>
          ))}}
        </div>
      </div>
    </section>
  );
}}
''',
        "logo-cloud": f'''export default function {pascal_name}() {{
  {lang_comment}
  const logos = ["Partner 1", "Partner 2", "Partner 3", "Partner 4", "Partner 5"];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <p className="mb-8 text-center text-sm text-muted-foreground uppercase tracking-widest">
          Trusted by leading companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {{logos.map((logo, i) => (
            <span key={{i}} className="text-xl font-bold text-muted-foreground opacity-50">{{logo}}</span>
          ))}}
        </div>
      </div>
    </section>
  );
}}
''',
        "how-it-works": f'''export default function {pascal_name}() {{
  {lang_comment}
  const steps = [
    {{ step: "01", title: "Sign Up", desc: "Create your account in seconds." }},
    {{ step: "02", title: "Configure", desc: "Set up your workspace and preferences." }},
    {{ step: "03", title: "Launch", desc: "Go live and start seeing results." }},
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {{steps.map((s, i) => (
            <div key={{i}} className="text-center">
              <span className="mb-4 inline-block text-5xl font-black text-primary/20">{{s.step}}</span>
              <h3 className="mb-2 text-xl font-semibold">{{s.title}}</h3>
              <p className="text-muted-foreground">{{s.desc}}</p>
            </div>
          ))}}
        </div>
      </div>
    </section>
  );
}}
''',
        "contact": f'''import {{ Button }} from "@/components/ui/button";

export default function {pascal_name}() {{
  {lang_comment}
  return (
    <section className="py-20">
      <div className="container mx-auto max-w-xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold">Get in Touch</h2>
        <p className="mb-8 text-center text-muted-foreground">We would love to hear from you.</p>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            placeholder="Your Message"
            rows={{5}}
            className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button className="w-full" type="submit">Send Message</Button>
        </form>
      </div>
    </section>
  );
}}
''',
    }

    return templates.get(category, templates["feature"])


# ─── metadata.yaml 생성 ────────────────────────────────────────
def make_metadata(args, keywords: list[str], tags: dict) -> str:
    today = datetime.now().strftime("%Y-%m-%d")
    all_tags = []
    all_tags.extend(parse_tags(args.tags_functional))
    all_tags.extend(parse_tags(args.tags_style))
    all_tags.extend(parse_tags(args.tags_layout))
    all_tags.extend(parse_tags(args.tags_industry))

    tag_lines = "\n".join(f'  - "{t}"' for t in all_tags)
    kw_lines = "\n".join(f'  - "{k}"' for k in keywords)

    return f"""name: "{args.name}"
category: "{args.category}"
language: "{args.language}"
parentPage: "{args.parent_page}"
source: "{args.source_url}"
sectionIndex: {args.section_index}
createdAt: "{today}"
keywords:
{kw_lines}
tags:
  functional:
{chr(10).join(f'    - "{t}"' for t in parse_tags(args.tags_functional))}
  style:
{chr(10).join(f'    - "{t}"' for t in parse_tags(args.tags_style))}
  layout:
{chr(10).join(f'    - "{t}"' for t in parse_tags(args.tags_layout))}
  industry:
{chr(10).join(f'    - "{t}"' for t in parse_tags(args.tags_industry))}
"""


# ─── 메인 ─────────────────────────────────────────────────────
def main():
    args = parse_args()
    pascal_name = to_pascal_case(args.name)
    keywords = parse_tags(args.keywords)

    out_dir = Path("src/components/registry") / args.name
    out_dir.mkdir(parents=True, exist_ok=True)

    component_code = make_component(pascal_name, args.category, args.language, args.image_path)
    metadata_yaml = make_metadata(args, keywords, {})

    (out_dir / "index.tsx").write_text(component_code, encoding="utf-8")
    (out_dir / "metadata.yaml").write_text(metadata_yaml, encoding="utf-8")

    print(f"[OK] Generated: {out_dir}")
    print(f"   - index.tsx")
    print(f"   - metadata.yaml")


if __name__ == "__main__":
    main()
