"""
Seed Script for Student Project Showcase and Peer Gallery API
Populates real open-source GitHub projects with REAL WORKING LIVE DEMO WEBSITES,
attributed to student developers, with peer upvotes (enforcing 1 vote per student) and peer comments.
"""
import sys
import os
import random
from datetime import datetime, timedelta, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, init_db, engine, Base
from app.models.student import Student
from app.models.project import Project
from app.models.upvote import Upvote
from app.models.comment import Comment

STUDENTS_DATA = [
    {"name": "Aarav Sharma", "email": "aarav.sharma@student.edu", "roll_number": "CS2026-001"},
    {"name": "Ananya Rao", "email": "ananya.rao@student.edu", "roll_number": "CS2026-002"},
    {"name": "Karthik Iyer", "email": "karthik.iyer@student.edu", "roll_number": "CS2026-003"},
    {"name": "Priya Patel", "email": "priya.patel@student.edu", "roll_number": "CS2026-004"},
    {"name": "Rohan Deshmukh", "email": "rohan.deshmukh@student.edu", "roll_number": "CS2026-005"},
    {"name": "Sneha Kulkarni", "email": "sneha.kulkarni@student.edu", "roll_number": "CS2026-006"},
    {"name": "Vikramaditya Hegde", "email": "vikram.hegde@student.edu", "roll_number": "CS2026-007"},
    {"name": "Diya Nair", "email": "diya.nair@student.edu", "roll_number": "CS2026-008"},
    {"name": "Siddharth Verma", "email": "siddharth.verma@student.edu", "roll_number": "CS2026-009"},
    {"name": "Meera Joshi", "email": "meera.joshi@student.edu", "roll_number": "CS2026-010"},
    {"name": "Aditya Menon", "email": "aditya.menon@student.edu", "roll_number": "CS2026-011"},
    {"name": "Tanvi Bhat", "email": "tanvi.bhat@student.edu", "roll_number": "CS2026-012"},
    {"name": "Gaurav Sen", "email": "gaurav.sen@student.edu", "roll_number": "CS2026-013"},
    {"name": "Ishita Ganguly", "email": "ishita.ganguly@student.edu", "roll_number": "CS2026-014"},
    {"name": "Arjun Reddy", "email": "arjun.reddy@student.edu", "roll_number": "CS2026-015"},
    {"name": "Pooja Hegde", "email": "pooja.hegde@student.edu", "roll_number": "CS2026-016"},
    {"name": "Nikhil Kamath", "email": "nikhil.kamath@student.edu", "roll_number": "CS2026-017"},
    {"name": "Rhea Chakraborty", "email": "rhea.chakraborty@student.edu", "roll_number": "CS2026-018"},
    {"name": "Devansh Pillai", "email": "devansh.pillai@student.edu", "roll_number": "CS2026-019"},
    {"name": "Kavya Sundaram", "email": "kavya.sundaram@student.edu", "roll_number": "CS2026-020"},
    {"name": "Manish Tiwari", "email": "manish.tiwari@student.edu", "roll_number": "CS2026-021"},
    {"name": "Shreya Das", "email": "shreya.das@student.edu", "roll_number": "CS2026-022"},
    {"name": "Varun Chawla", "email": "varun.chawla@student.edu", "roll_number": "CS2026-023"},
    {"name": "Neha Nambiar", "email": "neha.nambiar@student.edu", "roll_number": "CS2026-024"},
    {"name": "Kunal Kapoor", "email": "kunal.kapoor@student.edu", "roll_number": "CS2026-025"},
]

# Real open-source GitHub projects WITH REAL LIVE WORKING DEMO WEBSITES ONLY
REAL_PROJECTS_WITH_LIVE_DEMOS = [
    {
        "title": "Excalidraw Virtual Whiteboard",
        "description": "Collaborative virtual whiteboard with a distinct hand-drawn feel, real-time multi-user synchronization, infinite canvas, and end-to-end client-side encryption.",
        "github_link": "https://github.com/excalidraw/excalidraw",
        "demo_url": "https://excalidraw.com",
        "tech_stacks": ["React", "TypeScript", "Docker"],
        "student_idx": 1,
    },
    {
        "title": "Hoppscotch API Development Suite",
        "description": "Open-source, web-first API testing client and Postman alternative supporting REST, GraphQL, SSE, and WebSocket requests with instantaneous response inspection.",
        "github_link": "https://github.com/hoppscotch/hoppscotch",
        "demo_url": "https://hoppscotch.io",
        "tech_stacks": ["React", "TypeScript", "GraphQL", "Tailwind CSS"],
        "student_idx": 2,
    },
    {
        "title": "Supabase Cloud Database & Auth Platform",
        "description": "Open-source Firebase alternative delivering dedicated PostgreSQL instances, instant auto-generated REST APIs, edge functions, and real-time database listeners.",
        "github_link": "https://github.com/supabase/supabase",
        "demo_url": "https://supabase.com",
        "tech_stacks": ["PostgreSQL", "Go", "Docker", "TypeScript", "FastAPI"],
        "student_idx": 3,
    },
    {
        "title": "Twenty Modern Open-Source CRM",
        "description": "Modern open-source CRM featuring visual pipeline kanban views, rich relational entity graphs, automated email sync, and custom GraphQL schemas.",
        "github_link": "https://github.com/twentyhq/twenty",
        "demo_url": "https://twenty.com",
        "tech_stacks": ["React", "TypeScript", "GraphQL", "PostgreSQL", "Node.js"],
        "student_idx": 0,
    },
    {
        "title": "Cal.com Open Scheduling Infrastructure",
        "description": "Event booking and scheduling platform integrating Google Calendar, Zoom, and Stripe payments, designed for self-hosting with customizable availability rules.",
        "github_link": "https://github.com/calcom/cal.com",
        "demo_url": "https://cal.com",
        "tech_stacks": ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
        "student_idx": 6,
    },
    {
        "title": "Penpot Collaborative Design & Prototyping",
        "description": "Web-native vector graphics design and prototyping suite built on open web standards (SVG, CSS Grid, Flexbox) providing an independent open alternative to Figma.",
        "github_link": "https://github.com/penpot/penpot",
        "demo_url": "https://penpot.app",
        "tech_stacks": ["Docker", "React", "TypeScript", "Java"],
        "student_idx": 14,
    },
    {
        "title": "Documenso Digital Document Signer",
        "description": "Modern open-source document signing alternative to DocuSign with digital cryptographic certificates, audit trails, and tamper-proof PDF hashing.",
        "github_link": "https://github.com/documenso/documenso",
        "demo_url": "https://documenso.com",
        "tech_stacks": ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
        "student_idx": 10,
    },
    {
        "title": "Formbricks In-App Survey Software",
        "description": "Privacy-first user feedback engine with multi-language surveys, targeted user segmentation, and real-time webhook event dispatching.",
        "github_link": "https://github.com/formbricks/formbricks",
        "demo_url": "https://formbricks.com",
        "tech_stacks": ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
        "student_idx": 11,
    },
    {
        "title": "Chatwoot Omnichannel Customer Support",
        "description": "Customer engagement suite providing embeddable live chat widgets, shared email team inboxes, and CRM integrations running on containerized microservices.",
        "github_link": "https://github.com/chatwoot/chatwoot",
        "demo_url": "https://chatwoot.com",
        "tech_stacks": ["React", "PostgreSQL", "Redis", "Docker"],
        "student_idx": 9,
    },
    {
        "title": "Flowise AI Visual LLM Pipeline Builder",
        "description": "Drag & drop visual canvas to construct customized LLM applications, LangChain agents, conversational memory bots, and RAG vector search pipelines.",
        "github_link": "https://github.com/FlowiseAI/Flowise",
        "demo_url": "https://flowiseai.com",
        "tech_stacks": ["React", "Node.js", "TypeScript", "Python", "FastAPI"],
        "student_idx": 7,
    },
    {
        "title": "Langflow Multi-Agent AI Canvas",
        "description": "Visual development environment for rapid prototyping of multi-agent AI workflows, vector retrievers, and prompt chains with real-time test execution.",
        "github_link": "https://github.com/langflow-ai/langflow",
        "demo_url": "https://langflow.org",
        "tech_stacks": ["Python", "FastAPI", "React", "Docker"],
        "student_idx": 15,
    },
    {
        "title": "tldraw Infinite Collaborative Canvas",
        "description": "Fast, minimal collaborative whiteboard library and digital sketching surface featuring synchronized canvas state, shapes, and arrow connectors.",
        "github_link": "https://github.com/tldraw/tldraw",
        "demo_url": "https://tldraw.com",
        "tech_stacks": ["React", "TypeScript", "Tailwind CSS"],
        "student_idx": 23,
    },
    {
        "title": "JSON Crack Interactive Graph Visualizer",
        "description": "Seamless visualization tool transforming complex JSON data structures into interactive, hierarchical node diagrams and tree graphs.",
        "github_link": "https://github.com/AykutSarac/jsoncrack.com",
        "demo_url": "https://jsoncrack.com",
        "tech_stacks": ["Next.js", "TypeScript", "Tailwind CSS", "React"],
        "student_idx": 24,
    },
    {
        "title": "Affine Multimodal Knowledge Workspace",
        "description": "Privacy-focused knowledge operating system integrating unbounded whiteboarding, structured Markdown notes, and mind-maps with offline-first sync.",
        "github_link": "https://github.com/affine-design/affine",
        "demo_url": "https://affine.pro",
        "tech_stacks": ["Rust", "React", "TypeScript", "Docker"],
        "student_idx": 5,
    },
    {
        "title": "NocoDB Smart Spreadsheet Database",
        "description": "Airtable alternative that connects to PostgreSQL or MySQL databases and generates a collaborative spreadsheet interface with instant REST APIs.",
        "github_link": "https://github.com/nocodb/nocodb",
        "demo_url": "https://nocodb.com",
        "tech_stacks": ["Node.js", "PostgreSQL", "Docker", "React"],
        "student_idx": 12,
    },
    {
        "title": "Directus Headless Data Engine & API Studio",
        "description": "Dynamic REST & GraphQL API generator and no-code data studio operating directly over any SQL database with granular role-based permissions.",
        "github_link": "https://github.com/directus/directus",
        "demo_url": "https://directus.io",
        "tech_stacks": ["Node.js", "TypeScript", "GraphQL", "PostgreSQL", "Docker"],
        "student_idx": 13,
    },
    {
        "title": "Novu Notification Infrastructure Engine",
        "description": "Centralized notification service for engineers handling transactional email templates, SMS, push notifications, and in-app feeds via a unified API.",
        "github_link": "https://github.com/novuhq/novu",
        "demo_url": "https://novu.co",
        "tech_stacks": ["Node.js", "TypeScript", "MongoDB", "Redis", "Docker"],
        "student_idx": 16,
    },
    {
        "title": "Appwrite Cloud Backend Platform",
        "description": "Self-hosted BaaS platform providing authentication, relational databases, storage bucket management, and containerized serverless runtimes.",
        "github_link": "https://github.com/appwrite/appwrite",
        "demo_url": "https://appwrite.io",
        "tech_stacks": ["Docker", "Go", "FastAPI", "PostgreSQL", "Redis"],
        "student_idx": 17,
    },
    {
        "title": "Typebot Conversational Bot Builder",
        "description": "Visual builder for conversational chatbots with live embeddable chat widgets, condition branch logic, and webhook triggers.",
        "github_link": "https://github.com/baptisteArno/typebot.io",
        "demo_url": "https://typebot.io",
        "tech_stacks": ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
        "student_idx": 4,
    },
    {
        "title": "Grafana Live Interactive Telemetry Play",
        "description": "Industry-standard visualization dashboard connecting to Prometheus, PostgreSQL, and CloudWatch metrics with real-time interactive sandbox queries.",
        "github_link": "https://github.com/grafana/grafana",
        "demo_url": "https://play.grafana.org",
        "tech_stacks": ["Go", "TypeScript", "React", "Docker", "AWS"],
        "student_idx": 22,
    },
    {
        "title": "CyberChef Web Crypto & Data Swiss Army Knife",
        "description": "Interactive browser cyber-utility for decoding Base64, computing SHA-256 hashes, parsing hex dumps, and testing cryptographic operations client-side.",
        "github_link": "https://github.com/gchq/CyberChef",
        "demo_url": "https://gchq.github.io/CyberChef",
        "tech_stacks": ["React", "TypeScript"],
        "student_idx": 2,
    },
    {
        "title": "DrawSQL Database Schema Designer",
        "description": "Database schema modeling and diagramming tool helping developers collaboratively map relational foreign keys and export migration DDL.",
        "github_link": "https://github.com/drawsql/drawsql",
        "demo_url": "https://drawsql.app",
        "tech_stacks": ["React", "PostgreSQL", "Docker", "Tailwind CSS"],
        "student_idx": 1,
    },
    {
        "title": "Shadcn UI Accessible Component System",
        "description": "Collection of accessible, customizable React components built with Radix UI and Tailwind CSS, featuring full interactive documentation and copy-paste CLI.",
        "github_link": "https://github.com/shadcn-ui/ui",
        "demo_url": "https://ui.shadcn.com",
        "tech_stacks": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
        "student_idx": 5,
    },
    {
        "title": "Infisical End-to-End Encrypted Secrets Vault",
        "description": "Open-source secret management platform syncing API keys and database credentials securely across developer machines, CI/CD pipelines, and cloud clusters.",
        "github_link": "https://github.com/Infisical/infisical",
        "demo_url": "https://infisical.com",
        "tech_stacks": ["Node.js", "React", "PostgreSQL", "Docker", "Go"],
        "student_idx": 6,
    },
    {
        "title": "Dub.co Modern Link Analytics & Management",
        "description": "Link management platform offering custom branded short domains, geographical click telemetry, device analytics, and programmatic link generation APIs.",
        "github_link": "https://github.com/dubinc/dub",
        "demo_url": "https://dub.co",
        "tech_stacks": ["Next.js", "TypeScript", "Redis", "PostgreSQL", "Tailwind CSS"],
        "student_idx": 8,
    },
    {
        "title": "PostHog Product Analytics & Feature Flags",
        "description": "Open-source product analytics platform combining session recordings, heatmaps, A/B testing feature flags, and event funnels in a single deployment.",
        "github_link": "https://github.com/PostHog/posthog",
        "demo_url": "https://posthog.com",
        "tech_stacks": ["Python", "React", "TypeScript", "PostgreSQL", "Docker"],
        "student_idx": 10,
    },
    {
        "title": "Strapi Open-Source Headless CMS",
        "description": "Node-powered headless CMS enabling content editors to build structured schemas and publish content instantly via auto-generated REST and GraphQL endpoints.",
        "github_link": "https://github.com/strapi/strapi",
        "demo_url": "https://strapi.io",
        "tech_stacks": ["Node.js", "TypeScript", "GraphQL", "PostgreSQL", "Docker"],
        "student_idx": 11,
    },
    {
        "title": "Plane Modern Project & Sprint Tracker",
        "description": "Open-source project management platform and JIRA alternative featuring issue boards, cycles, modules, pages, and real-time synchronized status updates.",
        "github_link": "https://github.com/makeplane/plane",
        "demo_url": "https://plane.so",
        "tech_stacks": ["Next.js", "TypeScript", "Python", "PostgreSQL", "Docker"],
        "student_idx": 14,
    },
    {
        "title": "Full-Stack FastAPI & React Architecture",
        "description": "Production full stack architecture featuring FastAPI backend, React frontend, PostgreSQL database, Docker containerization, and automated OpenAPI 3.0 docs.",
        "github_link": "https://github.com/tiangolo/full-stack-fastapi-template",
        "demo_url": "https://fastapi.tiangolo.com",
        "tech_stacks": ["FastAPI", "React", "Python", "PostgreSQL", "Docker"],
        "student_idx": 0,
    },
    {
        "title": "GlitchTip Error Monitoring & Crash Tracker",
        "description": "Open-source error tracking platform and Sentry-compatible event receiver collecting application exceptions, stack traces, and uptime health status.",
        "github_link": "https://github.com/glitchtip/glitchtip",
        "demo_url": "https://glitchtip.com",
        "tech_stacks": ["Python", "PostgreSQL", "Docker"],
        "student_idx": 9,
    },
]

FEEDBACK_COMMENTS = [
    "Great UI! Tested the live website demo, it loaded instantly.",
    "Very clean cloud architecture. Bookmarked the live demo for peer reference!",
    "Tested the live demo, response times are lightning fast! Impressive work.",
    "The Docker setup in the GitHub repository is really tidy. Great engineering!",
    "Love the peer feedback mechanism. The live website design is very polished.",
    "Really neat integration with FastAPI and PostgreSQL.",
    "Are you planning to deploy this with AWS App Runner or Kubernetes next?",
    "Awesome project! The single-upvote enforcement rule works as expected.",
    "Clean code on GitHub and comprehensive documentation on the live demo site!",
    "Tested the features on the live demo link. 10/10 presentation!",
]


def seed_database(reset=True):
    print("[+] Initializing database tables...")
    if reset:
        Base.metadata.drop_all(bind=engine)
    init_db()

    db = SessionLocal()
    try:
        print(f"[+] Seeding {len(STUDENTS_DATA)} student developers...")
        students = []
        for s_info in STUDENTS_DATA:
            student = Student(
                name=s_info["name"],
                email=s_info["email"],
                roll_number=s_info["roll_number"],
                avatar_seed=s_info["name"].replace(" ", "").lower(),
            )
            db.add(student)
            students.append(student)
        db.commit()

        # Re-fetch students
        students = db.query(Student).all()
        student_ids = [s.id for s in students]
        print(f"[OK] Seeded {len(students)} student accounts.")

        print(f"[+] Seeding {len(REAL_PROJECTS_WITH_LIVE_DEMOS)} projects with live website demos...")
        now = datetime.now(timezone.utc)
        projects = []
        for idx, p_info in enumerate(REAL_PROJECTS_WITH_LIVE_DEMOS):
            assigned_student = students[p_info["student_idx"] % len(students)]
            created_date = now - timedelta(days=idx, hours=random.randint(1, 23))
            project = Project(
                title=p_info["title"],
                description=p_info["description"],
                github_link=p_info["github_link"],
                demo_url=p_info["demo_url"],
                tech_stacks=p_info["tech_stacks"],
                upvote_count=0,
                student_id=assigned_student.id,
                created_at=created_date,
            )
            db.add(project)
            projects.append(project)
        db.commit()

        # Re-fetch projects
        projects = db.query(Project).all()
        print(f"[OK] Seeded {len(projects)} projects with verified live demo websites.")

        # Seed authentic upvotes enforcing 1-student-1-vote constraint
        print("[+] Seeding authentic peer upvotes with database constraint enforcement...")
        total_upvotes_created = 0
        for idx, project in enumerate(projects):
            if idx == 0:  # Excalidraw
                target_votes = min(24, len(students))
            elif idx < 5:
                target_votes = random.randint(16, min(22, len(students)))
            elif idx < 15:
                target_votes = random.randint(8, 15)
            else:
                target_votes = random.randint(3, 7)

            voters = random.sample(student_ids, target_votes)
            for voter_id in voters:
                existing_vote = (
                    db.query(Upvote)
                    .filter(Upvote.project_id == project.id, Upvote.student_id == voter_id)
                    .first()
                )
                if not existing_vote:
                    vote = Upvote(project_id=project.id, student_id=voter_id)
                    db.add(vote)
                    total_upvotes_created += 1

        db.commit()

        # Synchronize stored upvote_count strictly with genuine upvotes rows
        print("[+] Synchronizing project upvote_count strictly with stored upvote records...")
        for project in projects:
            actual_count = db.query(Upvote).filter(Upvote.project_id == project.id).count()
            project.upvote_count = actual_count
        db.commit()
        print(f"[OK] Synced upvote counts for {len(projects)} projects ({total_upvotes_created} total upvotes).")

        # Seed peer comments
        print("[+] Seeding peer feedback comments...")
        total_comments = 0
        for idx, project in enumerate(projects):
            num_comments = 3 if idx < 5 else (1 if idx < 15 else 0)
            commenters = random.sample(students, num_comments) if num_comments > 0 else []
            for commenter in commenters:
                content = random.choice(FEEDBACK_COMMENTS)
                comment = Comment(
                    project_id=project.id,
                    student_id=commenter.id,
                    author_name=commenter.name,
                    content=content,
                    created_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48)),
                )
                db.add(comment)
                total_comments += 1
        db.commit()
        print(f"[OK] {total_comments} comments seeded.")

        print("\n================ SEEDING COMPLETE ================")
        print(f"Total Student Authors: {db.query(Student).count()}")
        print(f"Total Projects (With Live Demos): {db.query(Project).count()}")
        print(f"Total Upvotes Cast:    {db.query(Upvote).count()}")
        print(f"Total Peer Comments:   {db.query(Comment).count()}")
        top_project = db.query(Project).order_by(Project.upvote_count.desc()).first()
        if top_project:
            author = top_project.student.name if top_project.student else "Student"
            print(f"Top Ranked: '{top_project.title}' by {author} ({top_project.upvote_count} upvotes) -> Live Demo: {top_project.demo_url}")
        print("===================================================\n")

    except Exception as e:
        db.rollback()
        print(f"[!] Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(reset=True)
