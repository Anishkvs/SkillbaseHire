--
-- PostgreSQL database dump
--

\restrict c4h9ZmkF2x9kdOVTQBvTOWfdXWjlbkC31r0g8D16Oaf7RGrCC7nMFsPZAZLcDFe

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: skillbasehire_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO skillbasehire_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: skillbasehire_user
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: skillbasehire_user
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    job_id integer NOT NULL,
    candidate_id integer NOT NULL,
    status text DEFAULT 'applied'::text,
    cover_letter text DEFAULT ''::text,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.applications OWNER TO skillbasehire_user;

--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbasehire_user
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO skillbasehire_user;

--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbasehire_user
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: candidate_profiles; Type: TABLE; Schema: public; Owner: skillbasehire_user
--

CREATE TABLE public.candidate_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    headline text DEFAULT ''::text,
    bio text DEFAULT ''::text,
    skills text DEFAULT ''::text,
    phone text DEFAULT ''::text,
    job_title text DEFAULT ''::text,
    experience text DEFAULT ''::text,
    resume_filename text,
    work_status text DEFAULT ''::text,
    location text DEFAULT ''::text,
    linkedin text,
    github text
);


ALTER TABLE public.candidate_profiles OWNER TO skillbasehire_user;

--
-- Name: candidate_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbasehire_user
--

CREATE SEQUENCE public.candidate_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidate_profiles_id_seq OWNER TO skillbasehire_user;

--
-- Name: candidate_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbasehire_user
--

ALTER SEQUENCE public.candidate_profiles_id_seq OWNED BY public.candidate_profiles.id;


--
-- Name: job_skills; Type: TABLE; Schema: public; Owner: skillbasehire_user
--

CREATE TABLE public.job_skills (
    job_id integer NOT NULL,
    skill_id integer NOT NULL
);


ALTER TABLE public.job_skills OWNER TO skillbasehire_user;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: skillbasehire_user
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    recruiter_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    company text NOT NULL,
    location text DEFAULT ''::text,
    job_type text DEFAULT ''::text,
    salary_min integer,
    salary_max integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    requirements text,
    active text
);


ALTER TABLE public.jobs OWNER TO skillbasehire_user;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbasehire_user
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO skillbasehire_user;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbasehire_user
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: recruiter_profiles; Type: TABLE; Schema: public; Owner: skillbasehire_user
--

CREATE TABLE public.recruiter_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    company text NOT NULL,
    company_bio text DEFAULT ''::text,
    website text DEFAULT ''::text,
    phone text DEFAULT ''::text,
    job_title text DEFAULT ''::text,
    company_size text DEFAULT ''::text,
    industry text DEFAULT ''::text,
    company_location text DEFAULT ''::text
);


ALTER TABLE public.recruiter_profiles OWNER TO skillbasehire_user;

--
-- Name: recruiter_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbasehire_user
--

CREATE SEQUENCE public.recruiter_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recruiter_profiles_id_seq OWNER TO skillbasehire_user;

--
-- Name: recruiter_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbasehire_user
--

ALTER SEQUENCE public.recruiter_profiles_id_seq OWNED BY public.recruiter_profiles.id;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: skillbasehire_user
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    name text NOT NULL,
    category text DEFAULT ''::text,
    description text DEFAULT ''::text
);


ALTER TABLE public.skills OWNER TO skillbasehire_user;

--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbasehire_user
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_id_seq OWNER TO skillbasehire_user;

--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbasehire_user
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: user_skills; Type: TABLE; Schema: public; Owner: skillbasehire_user
--

CREATE TABLE public.user_skills (
    id integer NOT NULL,
    user_id integer NOT NULL,
    skill_id integer NOT NULL,
    verified integer DEFAULT 0,
    score integer DEFAULT 0,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_skills OWNER TO skillbasehire_user;

--
-- Name: user_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbasehire_user
--

CREATE SEQUENCE public.user_skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_skills_id_seq OWNER TO skillbasehire_user;

--
-- Name: user_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbasehire_user
--

ALTER SEQUENCE public.user_skills_id_seq OWNED BY public.user_skills.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: skillbasehire_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL,
    email_verified integer DEFAULT 0,
    verification_token text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['candidate'::text, 'recruiter'::text])))
);


ALTER TABLE public.users OWNER TO skillbasehire_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: skillbasehire_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO skillbasehire_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skillbasehire_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: candidate_profiles id; Type: DEFAULT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.candidate_profiles ALTER COLUMN id SET DEFAULT nextval('public.candidate_profiles_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: recruiter_profiles id; Type: DEFAULT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.recruiter_profiles ALTER COLUMN id SET DEFAULT nextval('public.recruiter_profiles_id_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Name: user_skills id; Type: DEFAULT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.user_skills ALTER COLUMN id SET DEFAULT nextval('public.user_skills_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: skillbasehire_user
--

COPY public.applications (id, job_id, candidate_id, status, cover_letter, applied_at) FROM stdin;
\.


--
-- Data for Name: candidate_profiles; Type: TABLE DATA; Schema: public; Owner: skillbasehire_user
--

COPY public.candidate_profiles (id, user_id, headline, bio, skills, phone, job_title, experience, resume_filename, work_status, location, linkedin, github) FROM stdin;
1	1							\N				
2	2							\N				
3	5							\N				
4	7	Manager - Business Transformation	Business Transformation professional with 4+ years of experience leading process mining, automation, and digital change initiatives for global banking and insurance clients. Skilled in deploying RPA, Celonis, and analytics to deliver operational efficiencies, risk reduction, and cost savings. Proven ability to drive technology adoption, process reengineering, and measurable business impact		+919526614644	Senior Engineer	10+ years	john_Anish_Kumar_Automation_QA_Resume_Sep_2025.pdf		Chennai	https://www.linkedin.com/in/michael-john96/	
5	8	Manager - Business Transformation			+919526614644	Senior Engineer	10+ years	johngmail.com_AnishKumar_Automation_QA_Resume_April_26.pdf		Chennai	https://www.linkedin.com/in/michael-john96/	
6	10	QA Engineer	Am passionate about performance engineering with 7+ years of experience as a Performance Tester and Engineer, I specialize in delivering robust end-to-end performance testing solutions that ensure system scalability, reliability, and efficiency. My expertise spans industry-leading tools like JMeter, LoadRunner, and Apica, paired with a deep understanding of performance testing methodologies and frameworks		+91 9843559666	Lead Enginner	5	resume_10_Priya.docx.docx	experienced	Kochi	https://www.linkedin.com/in/priya-raman-t1996/	
\.


--
-- Data for Name: job_skills; Type: TABLE DATA; Schema: public; Owner: skillbasehire_user
--

COPY public.job_skills (job_id, skill_id) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: skillbasehire_user
--

COPY public.jobs (id, recruiter_id, title, description, company, location, job_type, salary_min, salary_max, created_at, requirements, active) FROM stdin;
1	4	Python Developer	We need a Python dev.	TechCorp	Remote	Full-time	800000	1200000	2026-05-08 06:25:08		1
2	6	QA Enginner	Responsibilities \r\nWork closely with our web developers to seamlessly integrate testing into the development and build processes. \r\nDesign, develop, and execute manual tests, integration tests, and user-acceptance tests. \r\nRecommend testing tools based on the client’s needs. \r\nAbility to work on multiple projects simultaneously. \r\nAbility to work independently with minimal supervision. \r\nExperience in JIRA/bug management tools \r\nPerform black-box and grey-box testing. \r\nWork with Stakeholders, Business Analysts, and the development team to understand the business and technical requirements of applications. \r\n\r\n\r\nQualifications & Technical Skills\r\n\r\n5+ years of Quality Assurance experience, including 3+ years in Salesforce testing\r\nStrong knowledge of the Salesforce platform (Sales Cloud, Service Cloud, Lightning Experience) with hands-on testing experience\r\nExperience in end-to-end testing of Salesforce applications including UI, functional, regression, integration, and UAT\r\nSolid understanding of Salesforce components such as workflows, validation rules, and process automation\r\nHands-on experience with test automation tools such as Selenium, Provar, or similar frameworks\r\nStrong experience in API testing (REST/SOAP) using tools like Postman or RestAssured \r\nExperience testing integrations between Salesforce and external systems\r\nFamiliarity with browser Dev tools \r\nFamiliarity with CI/CD tools (Jenkins, Git, Azure DevOps, etc.) and release management processes\r\nExperience with test management and defect tracking tools such as JIRA, TestRail, or ALM\r\nStrong understanding of QA methodologies including test planning, test case design, and defect lifecycle management\r\nExperience working in Agile/Scrum environments with cross-functional teams\r\nStrong analytical, troubleshooting, and communication skills\r\n\r\n\r\nPreferred / Nice to Have\r\n\r\nExposure to Salesforce modules such as CPQ, Marketing Cloud, or Experience Cloud\r\nExposure to AI-driven Salesforce capabilities (e.g., Einstein Analytics)\r\nExperience with web/CMS/commerce \r\nExperience with Cross browser, multiple devices \r\nBrowser dev tools familiarity \r\nExperience testing integrations between Salesforce and CMS or digital platforms\r\nSalesforce certifications (e.g., Administrator, Platform App Builder)\r\n1 year or equivalent working in software consulting companies working with external clients.	UST	Kochi	Full-time	120000	150000	2026-05-08 11:53:48		1
\.


--
-- Data for Name: recruiter_profiles; Type: TABLE DATA; Schema: public; Owner: skillbasehire_user
--

COPY public.recruiter_profiles (id, user_id, company, company_bio, website, phone, job_title, company_size, industry, company_location) FROM stdin;
1	3	TechCorp							
2	4	TechCorp							
3	6	UST							
4	9	UST		ust.com	+919526614644	HR	1000+	Technology	Kochi
5	11	CloudBridge Technologies			+91 9582254655	Talent Acquisition Manager			
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: skillbasehire_user
--

COPY public.skills (id, name, category, description) FROM stdin;
1	Python	Programming	General-purpose programming language
2	JavaScript	Programming	Web scripting language
3	Java	Programming	Object-oriented programming language
4	TypeScript	Programming	Typed superset of JavaScript
5	C++	Programming	Systems programming language
6	Go	Programming	Compiled systems language
7	Rust	Programming	Memory-safe systems language
8	React	Frontend	JavaScript UI library
9	Vue.js	Frontend	Progressive JavaScript framework
10	Angular	Frontend	TypeScript-based web framework
11	HTML/CSS	Frontend	Web markup and styling
12	Tailwind CSS	Frontend	Utility-first CSS framework
13	Node.js	Backend	JavaScript runtime
14	Django	Backend	Python web framework
15	Flask	Backend	Lightweight Python web framework
16	FastAPI	Backend	Modern Python API framework
17	Spring Boot	Backend	Java web framework
18	SQL	Database	Structured query language
19	PostgreSQL	Database	Advanced open-source database
20	MySQL	Database	Popular relational database
21	MongoDB	Database	Document-oriented NoSQL database
22	Redis	Database	In-memory data structure store
23	AWS	Cloud	Amazon Web Services
24	Azure	Cloud	Microsoft Azure
25	GCP	Cloud	Google Cloud Platform
26	Docker	DevOps	Containerization platform
27	Kubernetes	DevOps	Container orchestration
28	CI/CD	DevOps	Continuous integration and deployment
29	Machine Learning	AI/ML	Statistical learning algorithms
30	Deep Learning	AI/ML	Neural network-based learning
31	Data Analysis	Data	Statistical data examination
32	Data Visualization	Data	Graphical data representation
33	Selenium	Testing	Web automation testing
34	Jest	Testing	JavaScript testing framework
35	PyTest	Testing	Python testing framework
36	REST APIs	Backend	RESTful API development
37	GraphQL	Backend	Query language for APIs
38	Git	Tools	Version control system
39	Linux	Tools	Open-source operating system
40	Agile/Scrum	Methodology	Agile project management
641	Playwright	Testing	Modern end-to-end browser testing framework
642	Appium	Testing	Mobile app automation testing framework
643	API Testing	Testing	REST and GraphQL API testing
644	Manual Testing	Testing	Manual software quality assurance
645	Cypress	Testing	Fast, reliable end-to-end testing for the web
646	TestNG	Testing	Java testing framework inspired by JUnit
\.


--
-- Data for Name: user_skills; Type: TABLE DATA; Schema: public; Owner: skillbasehire_user
--

COPY public.user_skills (id, user_id, skill_id, verified, score, added_at) FROM stdin;
1	2	1	0	0	2026-05-08 06:24:59
2	5	29	0	0	2026-05-08 07:32:35
4	5	23	0	25	2026-05-08 09:12:07
9	5	24	0	0	2026-05-08 10:26:42
10	5	16	0	0	2026-05-08 10:30:46
14	5	15	0	0	2026-05-08 11:03:38
15	5	32	0	25	2026-05-08 11:10:38
16	5	31	0	25	2026-05-08 11:27:12
17	5	25	0	0	2026-05-08 11:38:01
19	7	24	0	0	2026-05-08 15:22:56
20	7	20	0	0	2026-05-08 15:22:56
21	7	33	0	0	2026-05-08 15:22:56
22	8	19	0	0	2026-05-08 15:44:23
23	8	11	0	0	2026-05-08 15:44:23
24	8	16	0	0	2026-05-08 15:44:42
25	10	3	0	0	2026-05-09 05:04:50
26	10	2	0	0	2026-05-09 05:04:50
27	10	643	1	87	2026-05-09 05:04:50
28	10	33	0	0	2026-05-09 05:04:50
29	10	646	0	0	2026-05-09 05:04:50
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: skillbasehire_user
--

COPY public.users (id, name, email, password_hash, role, email_verified, verification_token, created_at) FROM stdin;
1	Test User	test@example.com	scrypt:32768:8:1$sGqWgKptg4ag7UyE$0ad239306eb4f4d20f4ebe5e3cd4b590d3e38ff562144343ba5cfcb9579ae281d419be54ab9d255543267a919c824ef0b7ac826bea82a8334094b0f11742ea1a	candidate	1	\N	2026-05-08 06:24:46
2	Test User	test2@example.com	scrypt:32768:8:1$ScjfM91riQaskDNa$1e39161ecb8d04cb53ce73eac4dd1b1722fcd6e8b2853c61770e11149407da58588f1ff0e6790be75e4d89c580fbf614875917aeda1f9c715e49ecfe4b47d8d7	candidate	1	\N	2026-05-08 06:24:59
3	HR Manager	hr@company.com	scrypt:32768:8:1$AhMQCOJbFrTKNP97$284cc25361c1972694c42bc9bb9ca233c565d81c9ae0955d20ce6d2a2176254592f6d691ac5a919f8218dbac839fcfdf364a7d9eff4d99812178c044082c89a0	recruiter	1	\N	2026-05-08 06:24:59
4	HR Manager	hr2@company.com	scrypt:32768:8:1$6JfNf3gHvbRdV9N3$f85cac9e775954fde02ac8098bb009a2a1d3cd75e0d3f5b8534d04d8b35fce77fc8ef7ddfce49b51a00b85f34e4bb0be00f551b573f87abaf92bcb4c178c76c1	recruiter	1	\N	2026-05-08 06:25:08
5	test	test@gmail.com	scrypt:32768:8:1$X6XvwBGzO6OlAGSa$d57365ed1f63d7ca7fb287df16dd289b3eda88bd7bff234fea6637a9659018c22a421d7cba1dce5eca4627b39b62ab2654b8eaac658c9587e6db4185872c231f	candidate	1	\N	2026-05-08 07:32:13
6	Sree	sree@ust.com	scrypt:32768:8:1$m3UHRVjjU9XDngkR$e73e500a59552e8cddafef56045127bb2d01e7071710d49d761fb2b7c0a6e470a0f9ab73dcf348052ad3ff39760b2cf4daaba0575c18294f061ae494c8017e9a	recruiter	1	\N	2026-05-08 11:50:49
7	Michael	john	scrypt:32768:8:1$uGbKnB0n7jCmKB3w$439fb4805dc3f73134d514d9e75d160818a610b9bc3f564417261bff048b8db6e00964dd1f721db6c8937073f24609fabc603be390d698799cd8aa3615eb0e3b	candidate	0	ImpvaG4i.af4ABg.4brIBQQf6mzTyrStbH57CAzbBYs	2026-05-08 15:22:56
8	Michael	john@gmail.com	scrypt:32768:8:1$tvCkFh0R6fOneOzZ$bc9f23e6efb7c55e33fa1987d1383537eb785fa8e02c49c612eeb6e7093ecac2acec77e5eda5bc60e67120e7b744df50b1817e77fbb82f33ff13dfbbf275d643	candidate	0	ImpvaG5AZ21haWwuY29tIg.af4FKA.nLrmE_R1aFHLlf497m-i9JWuVx8	2026-05-08 15:44:23
9	AnishKumar	anishkumar.vijayan@ust.com	scrypt:32768:8:1$ziSuE0r5RpmKTfWX$a84853e266b168d43c846ff9c48ad6a21a9749e863959a3face23a3804ce0fba929101411938074bfd251ad1b2ef988a5cbd04e62b759869c5d3f15e7516b0c9	recruiter	0	ImFuaXNoa3VtYXIudmlqYXlhbkB1c3QuY29tIg.af4JBg.mV7WsXY77VAEM04ZXbmQ1WW7xts	2026-05-08 16:02:09
10	Priya Raman	priyaraman@gmail.com	scrypt:32768:8:1$5McBNz0PVjgvRHZm$4be30875198d94964ee0de93117600015e0c3866516f605eb40876fd932fc03fbc50cfd0b591ad001636879530a9f3b849ab5eaa21aaa97b6d08001325cb3021	candidate	0	InByaXlhcmFtYW5AZ21haWwuY29tIg.af7BaA.PdDL_kxhR74ZqvKWUoHUYTYTr5c	2026-05-09 05:04:50
11	Rohit Verma	rohit@cloudbridge.com	scrypt:32768:8:1$dRqmfNHQXzQ6PiU7$a2693bdf258b93e87d83f1cc786d0abdc5c6067125ea5c9ee36d257ddd9cde5b8a55da5e0a639ba7962ca8e64e9c2f3cfe34de2f1a1c7868b32a47a8312edab0	recruiter	0	InJvaGl0QGNsb3VkYnJpZGdlLmNvbSI.af7Klw.kPymWi02OD3HDWzbVMw1bUEetI8	2026-05-09 05:48:07
\.


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbasehire_user
--

SELECT pg_catalog.setval('public.applications_id_seq', 1, false);


--
-- Name: candidate_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbasehire_user
--

SELECT pg_catalog.setval('public.candidate_profiles_id_seq', 6, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbasehire_user
--

SELECT pg_catalog.setval('public.jobs_id_seq', 2, true);


--
-- Name: recruiter_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbasehire_user
--

SELECT pg_catalog.setval('public.recruiter_profiles_id_seq', 5, true);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbasehire_user
--

SELECT pg_catalog.setval('public.skills_id_seq', 922, true);


--
-- Name: user_skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbasehire_user
--

SELECT pg_catalog.setval('public.user_skills_id_seq', 29, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skillbasehire_user
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- Name: applications applications_job_id_candidate_id_key; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_candidate_id_key UNIQUE (job_id, candidate_id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: candidate_profiles candidate_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_pkey PRIMARY KEY (id);


--
-- Name: candidate_profiles candidate_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_user_id_key UNIQUE (user_id);


--
-- Name: job_skills job_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_pkey PRIMARY KEY (job_id, skill_id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: recruiter_profiles recruiter_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.recruiter_profiles
    ADD CONSTRAINT recruiter_profiles_pkey PRIMARY KEY (id);


--
-- Name: recruiter_profiles recruiter_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.recruiter_profiles
    ADD CONSTRAINT recruiter_profiles_user_id_key UNIQUE (user_id);


--
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: user_skills user_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_pkey PRIMARY KEY (id);


--
-- Name: user_skills user_skills_user_id_skill_id_key; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_user_id_skill_id_key UNIQUE (user_id, skill_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_application_candidate; Type: INDEX; Schema: public; Owner: skillbasehire_user
--

CREATE INDEX idx_application_candidate ON public.applications USING btree (candidate_id);


--
-- Name: idx_application_job; Type: INDEX; Schema: public; Owner: skillbasehire_user
--

CREATE INDEX idx_application_job ON public.applications USING btree (job_id);


--
-- Name: idx_candidate_user; Type: INDEX; Schema: public; Owner: skillbasehire_user
--

CREATE INDEX idx_candidate_user ON public.candidate_profiles USING btree (user_id);


--
-- Name: idx_job_recruiter; Type: INDEX; Schema: public; Owner: skillbasehire_user
--

CREATE INDEX idx_job_recruiter ON public.jobs USING btree (recruiter_id);


--
-- Name: idx_recruiter_user; Type: INDEX; Schema: public; Owner: skillbasehire_user
--

CREATE INDEX idx_recruiter_user ON public.recruiter_profiles USING btree (user_id);


--
-- Name: idx_user_email; Type: INDEX; Schema: public; Owner: skillbasehire_user
--

CREATE INDEX idx_user_email ON public.users USING btree (email);


--
-- Name: applications applications_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: applications applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: candidate_profiles candidate_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_skills job_skills_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_skills job_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_recruiter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_recruiter_id_fkey FOREIGN KEY (recruiter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recruiter_profiles recruiter_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.recruiter_profiles
    ADD CONSTRAINT recruiter_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_skills user_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: user_skills user_skills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: skillbasehire_user
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: skillbasehire_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict c4h9ZmkF2x9kdOVTQBvTOWfdXWjlbkC31r0g8D16Oaf7RGrCC7nMFsPZAZLcDFe

