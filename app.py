from flask import Flask, render_template, request, redirect, url_for, session, flash, g
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime
from functools import wraps

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'skillbasehire-dev-secret-2024')

DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'skillbasehire.db')


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db


@app.teardown_appcontext
def close_connection(_exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def init_db():
    with app.app_context():
        db = get_db()
        db.executescript('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('candidate','recruiter')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS candidate_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                headline TEXT DEFAULT '',
                location TEXT DEFAULT '',
                bio TEXT DEFAULT '',
                linkedin TEXT DEFAULT '',
                github TEXT DEFAULT '',
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS recruiter_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                company TEXT NOT NULL,
                company_bio TEXT DEFAULT '',
                website TEXT DEFAULT '',
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                category TEXT NOT NULL,
                description TEXT DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS user_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                skill_id INTEGER NOT NULL,
                verified INTEGER DEFAULT 0,
                score INTEGER DEFAULT 0,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, skill_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (skill_id) REFERENCES skills(id)
            );
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recruiter_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                location TEXT NOT NULL,
                job_type TEXT NOT NULL DEFAULT 'Full-time',
                description TEXT NOT NULL,
                requirements TEXT DEFAULT '',
                salary_min INTEGER DEFAULT 0,
                salary_max INTEGER DEFAULT 0,
                active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (recruiter_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS job_skills (
                job_id INTEGER NOT NULL,
                skill_id INTEGER NOT NULL,
                PRIMARY KEY (job_id, skill_id),
                FOREIGN KEY (job_id) REFERENCES jobs(id),
                FOREIGN KEY (skill_id) REFERENCES skills(id)
            );
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER NOT NULL,
                candidate_id INTEGER NOT NULL,
                status TEXT DEFAULT 'applied',
                cover_letter TEXT DEFAULT '',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(job_id, candidate_id),
                FOREIGN KEY (job_id) REFERENCES jobs(id),
                FOREIGN KEY (candidate_id) REFERENCES users(id)
            );
        ''')

        skills_data = [
            ('Python', 'Programming', 'General-purpose programming language'),
            ('JavaScript', 'Programming', 'Web scripting language'),
            ('Java', 'Programming', 'Object-oriented programming language'),
            ('TypeScript', 'Programming', 'Typed superset of JavaScript'),
            ('C++', 'Programming', 'Systems programming language'),
            ('Go', 'Programming', 'Compiled systems language'),
            ('Rust', 'Programming', 'Memory-safe systems language'),
            ('React', 'Frontend', 'JavaScript UI library'),
            ('Vue.js', 'Frontend', 'Progressive JavaScript framework'),
            ('Angular', 'Frontend', 'TypeScript-based web framework'),
            ('HTML/CSS', 'Frontend', 'Web markup and styling'),
            ('Tailwind CSS', 'Frontend', 'Utility-first CSS framework'),
            ('Node.js', 'Backend', 'JavaScript runtime'),
            ('Django', 'Backend', 'Python web framework'),
            ('Flask', 'Backend', 'Lightweight Python web framework'),
            ('FastAPI', 'Backend', 'Modern Python API framework'),
            ('Spring Boot', 'Backend', 'Java web framework'),
            ('SQL', 'Database', 'Structured query language'),
            ('PostgreSQL', 'Database', 'Advanced open-source database'),
            ('MySQL', 'Database', 'Popular relational database'),
            ('MongoDB', 'Database', 'Document-oriented NoSQL database'),
            ('Redis', 'Database', 'In-memory data structure store'),
            ('AWS', 'Cloud', 'Amazon Web Services'),
            ('Azure', 'Cloud', 'Microsoft Azure'),
            ('GCP', 'Cloud', 'Google Cloud Platform'),
            ('Docker', 'DevOps', 'Containerization platform'),
            ('Kubernetes', 'DevOps', 'Container orchestration'),
            ('CI/CD', 'DevOps', 'Continuous integration and deployment'),
            ('Machine Learning', 'AI/ML', 'Statistical learning algorithms'),
            ('Deep Learning', 'AI/ML', 'Neural network-based learning'),
            ('Data Analysis', 'Data', 'Statistical data examination'),
            ('Data Visualization', 'Data', 'Graphical data representation'),
            ('Selenium', 'Testing', 'Web automation testing'),
            ('Jest', 'Testing', 'JavaScript testing framework'),
            ('PyTest', 'Testing', 'Python testing framework'),
            ('REST APIs', 'Backend', 'RESTful API development'),
            ('GraphQL', 'Backend', 'Query language for APIs'),
            ('Git', 'Tools', 'Version control system'),
            ('Linux', 'Tools', 'Open-source operating system'),
            ('Agile/Scrum', 'Methodology', 'Agile project management'),
        ]
        db.executemany(
            'INSERT OR IGNORE INTO skills (name, category, description) VALUES (?, ?, ?)',
            skills_data
        )
        db.commit()


# ── Jinja2 filters ──────────────────────────────────────────────────────────

@app.template_filter('timeago')
def timeago_filter(date_str):
    if not date_str:
        return ''
    try:
        if isinstance(date_str, str):
            dt = datetime.strptime(str(date_str)[:19], '%Y-%m-%d %H:%M:%S')
        else:
            dt = date_str
        diff = datetime.now() - dt
        if diff.days == 0:
            hours = diff.seconds // 3600
            return 'Just now' if hours == 0 else f'{hours}h ago'
        elif diff.days == 1:
            return 'Yesterday'
        elif diff.days < 7:
            return f'{diff.days}d ago'
        elif diff.days < 30:
            return f'{diff.days // 7}w ago'
        else:
            return dt.strftime('%b %d, %Y')
    except Exception:
        return str(date_str)


@app.template_filter('salary')
def salary_filter(job):
    mn, mx = job['salary_min'], job['salary_max']
    if not mn and not mx:
        return 'Negotiable'
    if mn and mx:
        return f'${mn // 1000}K – ${mx // 1000}K'
    if mn:
        return f'${mn // 1000}K+'
    return f'Up to ${mx // 1000}K'


# ── Auth helpers ─────────────────────────────────────────────────────────────

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to continue.', 'error')
            return redirect(url_for('home'))
        return f(*args, **kwargs)
    return decorated


def candidate_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to continue.', 'error')
            return redirect(url_for('candidate_login'))
        if session.get('role') != 'candidate':
            flash('This page is for candidates only.', 'error')
            return redirect(url_for('home'))
        return f(*args, **kwargs)
    return decorated


def recruiter_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to continue.', 'error')
            return redirect(url_for('recruiter_login'))
        if session.get('role') != 'recruiter':
            flash('This page is for recruiters only.', 'error')
            return redirect(url_for('home'))
        return f(*args, **kwargs)
    return decorated


def get_current_user():
    if 'user_id' not in session:
        return None
    return get_db().execute('SELECT * FROM users WHERE id = ?', [session['user_id']]).fetchone()


def parse_skills_data(raw):
    """Parse 'Name:verified,Name:verified' string into list of dicts."""
    if not raw:
        return []
    result = []
    for item in raw.split(','):
        parts = item.strip().split(':')
        if len(parts) == 2:
            result.append({'name': parts[0], 'verified': parts[1] == '1'})
    return result


# ── Home ─────────────────────────────────────────────────────────────────────

@app.route('/')
def home():
    db = get_db()
    recent_jobs = db.execute('''
        SELECT j.*, rp.company AS company_name,
               (SELECT GROUP_CONCAT(s.name, ', ')
                FROM job_skills js JOIN skills s ON js.skill_id = s.id
                WHERE js.job_id = j.id) AS skills_list
        FROM jobs j
        JOIN recruiter_profiles rp ON j.recruiter_id = rp.user_id
        WHERE j.active = 1
        ORDER BY j.created_at DESC LIMIT 6
    ''').fetchall()

    stats = {
        'jobs': db.execute('SELECT COUNT(*) FROM jobs WHERE active=1').fetchone()[0],
        'candidates': db.execute("SELECT COUNT(*) FROM users WHERE role='candidate'").fetchone()[0],
        'companies': db.execute("SELECT COUNT(DISTINCT company) FROM jobs WHERE active=1").fetchone()[0],
    }
    return render_template('index.html', jobs=recent_jobs, stats=stats, user=get_current_user())


# ── Jobs ─────────────────────────────────────────────────────────────────────

@app.route('/jobs')
def jobs():
    db = get_db()
    search = request.args.get('q', '').strip()
    location = request.args.get('location', '').strip()
    job_type = request.args.get('type', '').strip()

    query = '''
        SELECT j.*, rp.company AS company_name,
               (SELECT GROUP_CONCAT(s.name, ', ')
                FROM job_skills js JOIN skills s ON js.skill_id = s.id
                WHERE js.job_id = j.id) AS skills_list
        FROM jobs j
        JOIN recruiter_profiles rp ON j.recruiter_id = rp.user_id
        WHERE j.active = 1
    '''
    params = []
    if search:
        query += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.company LIKE ?)'
        params += [f'%{search}%', f'%{search}%', f'%{search}%']
    if location:
        query += ' AND j.location LIKE ?'
        params.append(f'%{location}%')
    if job_type:
        query += ' AND j.job_type = ?'
        params.append(job_type)
    query += ' ORDER BY j.created_at DESC'

    job_list = db.execute(query, params).fetchall()
    return render_template('jobs.html', jobs=job_list,
                           search=search, location=location, job_type=job_type,
                           user=get_current_user())


@app.route('/jobs/<int:job_id>')
def job_detail(job_id):
    db = get_db()
    job = db.execute('''
        SELECT j.*, rp.company AS company_name, rp.company_bio, rp.website,
               u.name AS recruiter_name
        FROM jobs j
        JOIN recruiter_profiles rp ON j.recruiter_id = rp.user_id
        JOIN users u ON j.recruiter_id = u.id
        WHERE j.id = ? AND j.active = 1
    ''', [job_id]).fetchone()

    if not job:
        flash('Job not found.', 'error')
        return redirect(url_for('jobs'))

    job_skills = db.execute('''
        SELECT s.* FROM job_skills js JOIN skills s ON js.skill_id = s.id
        WHERE js.job_id = ?
    ''', [job_id]).fetchall()

    already_applied = False
    my_skill_names = set()
    my_verified_names = set()
    if session.get('role') == 'candidate':
        already_applied = db.execute(
            'SELECT id FROM applications WHERE job_id=? AND candidate_id=?',
            [job_id, session['user_id']]
        ).fetchone() is not None
        for row in db.execute('''
            SELECT s.name, us.verified FROM user_skills us
            JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ?
        ''', [session['user_id']]).fetchall():
            my_skill_names.add(row['name'])
            if row['verified']:
                my_verified_names.add(row['name'])

    return render_template('job_detail.html', job=job, job_skills=job_skills,
                           already_applied=already_applied,
                           my_skill_names=my_skill_names,
                           my_verified_names=my_verified_names,
                           user=get_current_user())


# ── Skills page ───────────────────────────────────────────────────────────────

@app.route('/skills')
def skills_page():
    db = get_db()
    all_skills = db.execute('SELECT * FROM skills ORDER BY category, name').fetchall()

    user_added = set()
    user_verified = set()
    if session.get('role') == 'candidate':
        for row in db.execute(
            'SELECT skill_id, verified FROM user_skills WHERE user_id=?',
            [session['user_id']]
        ).fetchall():
            user_added.add(row['skill_id'])
            if row['verified']:
                user_verified.add(row['skill_id'])

    skills_by_category = {}
    for s in all_skills:
        cat = s['category']
        if cat not in skills_by_category:
            skills_by_category[cat] = []
        skills_by_category[cat].append({
            'id': s['id'], 'name': s['name'], 'description': s['description'],
            'added': s['id'] in user_added, 'verified': s['id'] in user_verified,
        })

    return render_template('skills.html', skills_by_category=skills_by_category,
                           user=get_current_user())


@app.route('/skills/add/<int:skill_id>', methods=['POST'])
@candidate_required
def add_skill(skill_id):
    db = get_db()
    db.execute('INSERT OR IGNORE INTO user_skills (user_id, skill_id) VALUES (?, ?)',
               [session['user_id'], skill_id])
    db.commit()
    flash('Skill added to your profile!', 'success')
    return redirect(url_for('skills_page'))


QUIZ_BANK = {
    'Python': [
        {'q': 'What is the output of type([])?', 'options': ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "list"], 'answer': 0},
        {'q': 'Which keyword defines a function in Python?', 'options': ['func', 'def', 'function', 'lambda'], 'answer': 1},
        {'q': 'What does PEP stand for?', 'options': ['Python Enhancement Proposal', 'Python Execution Protocol', 'Program Enhancement Package', 'Python Error Package'], 'answer': 0},
        {'q': 'How do you create a list comprehension?', 'options': ['[x for x in range(5)]', '{x for x in range(5)}', '(x for x in range(5))', 'list(x for x in 5)'], 'answer': 0},
    ],
    'JavaScript': [
        {'q': 'Which operator checks strict equality?', 'options': ['==', '===', '=', '!='], 'answer': 1},
        {'q': 'What does typeof null return?', 'options': ['null', 'undefined', 'object', 'boolean'], 'answer': 2},
        {'q': 'Which method adds an element to the end of an array?', 'options': ['push()', 'pop()', 'shift()', 'append()'], 'answer': 0},
        {'q': 'What is a closure in JavaScript?', 'options': ['A function with access to its outer scope', 'A class constructor', 'A type of loop', 'An import statement'], 'answer': 0},
    ],
    'React': [
        {'q': 'Which hook handles side effects?', 'options': ['useState', 'useEffect', 'useContext', 'useReducer'], 'answer': 1},
        {'q': 'What is JSX?', 'options': ['A database query language', 'A syntax extension for JavaScript', 'A CSS preprocessor', 'A testing framework'], 'answer': 1},
        {'q': 'What does useState return?', 'options': ['A value only', 'A setter only', 'A value and a setter function', 'An event handler'], 'answer': 2},
        {'q': 'Which lifecycle runs after component mounts?', 'options': ['componentWillMount', 'componentDidMount', 'componentDidUpdate', 'render'], 'answer': 1},
    ],
    'SQL': [
        {'q': 'Which clause filters rows?', 'options': ['ORDER BY', 'GROUP BY', 'WHERE', 'HAVING'], 'answer': 2},
        {'q': 'What does JOIN do?', 'options': ['Combines rows from two tables', 'Deletes rows', 'Adds a column', 'Sorts results'], 'answer': 0},
        {'q': 'Which aggregate counts rows?', 'options': ['SUM()', 'COUNT()', 'MAX()', 'AVG()'], 'answer': 1},
        {'q': 'What is a PRIMARY KEY?', 'options': ['A unique identifier for each row', 'The first column', 'An index', 'A foreign reference'], 'answer': 0},
    ],
}

DEFAULT_QUESTIONS = lambda name: [
    {'q': f'Have you used {name} in a real project?', 'options': ['Yes, extensively', 'Yes, moderately', 'Yes, briefly', 'No, only studied it'], 'answer': 0},
    {'q': f'How would you rate your {name} expertise?', 'options': ['Expert (5+ years)', 'Advanced (3-5 years)', 'Intermediate (1-3 years)', 'Beginner (<1 year)'], 'answer': 0},
    {'q': f'Can you explain core {name} concepts to others?', 'options': ['Yes, confidently', 'Yes, mostly', 'Partially', 'Not yet'], 'answer': 0},
    {'q': f'Do you keep up with {name} updates and best practices?', 'options': ['Yes, actively', 'Mostly yes', 'Occasionally', 'Rarely'], 'answer': 0},
]


@app.route('/skills/verify/<int:skill_id>', methods=['GET', 'POST'])
@candidate_required
def verify_skill(skill_id):
    db = get_db()
    skill = db.execute('SELECT * FROM skills WHERE id=?', [skill_id]).fetchone()
    if not skill:
        flash('Skill not found.', 'error')
        return redirect(url_for('skills_page'))

    questions = QUIZ_BANK.get(skill['name'], DEFAULT_QUESTIONS(skill['name']))

    if request.method == 'POST':
        score = sum(
            1 for i, q in enumerate(questions)
            if request.form.get(f'q{i}', type=int) == q['answer']
        )
        pct = int((score / len(questions)) * 100)
        verified = 1 if pct >= 66 else 0

        existing = db.execute(
            'SELECT id FROM user_skills WHERE user_id=? AND skill_id=?',
            [session['user_id'], skill_id]
        ).fetchone()
        if existing:
            db.execute('UPDATE user_skills SET verified=?, score=? WHERE user_id=? AND skill_id=?',
                       [verified, pct, session['user_id'], skill_id])
        else:
            db.execute('INSERT INTO user_skills (user_id, skill_id, verified, score) VALUES (?,?,?,?)',
                       [session['user_id'], skill_id, verified, pct])
        db.commit()

        if verified:
            flash(f'You scored {pct}% and earned a verified badge for {skill["name"]}!', 'success')
        else:
            flash(f'You scored {pct}%. Score 66%+ to get verified. Keep practicing!', 'warning')
        return redirect(url_for('candidate_dashboard'))

    db.execute('INSERT OR IGNORE INTO user_skills (user_id, skill_id) VALUES (?,?)',
               [session['user_id'], skill_id])
    db.commit()
    return render_template('verify_skill.html', skill=skill, questions=questions,
                           user=get_current_user())


# ── Candidate auth ────────────────────────────────────────────────────────────

@app.route('/candidate/signup', methods=['GET', 'POST'])
def candidate_signup():
    if session.get('role') == 'candidate':
        return redirect(url_for('candidate_dashboard'))

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm = request.form.get('confirm_password', '')

        if not all([name, email, password, confirm]):
            flash('All fields are required.', 'error')
        elif password != confirm:
            flash('Passwords do not match.', 'error')
        elif len(password) < 6:
            flash('Password must be at least 6 characters.', 'error')
        elif get_db().execute('SELECT id FROM users WHERE email=?', [email]).fetchone():
            flash('An account with this email already exists.', 'error')
        else:
            db = get_db()
            cur = db.execute(
                'INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
                [name, email, generate_password_hash(password), 'candidate']
            )
            db.execute('INSERT INTO candidate_profiles (user_id) VALUES (?)', [cur.lastrowid])
            db.commit()
            session.update({'user_id': cur.lastrowid, 'role': 'candidate', 'name': name})
            flash(f'Welcome, {name}! Your account is ready.', 'success')
            return redirect(url_for('candidate_dashboard'))

    return render_template('candidate_signup.html', user=None)


@app.route('/candidate/login', methods=['GET', 'POST'])
def candidate_login():
    if session.get('role') == 'candidate':
        return redirect(url_for('candidate_dashboard'))

    email = ''
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        user = get_db().execute(
            "SELECT * FROM users WHERE email=? AND role='candidate'", [email]
        ).fetchone()
        if user and check_password_hash(user['password_hash'], password):
            session.update({'user_id': user['id'], 'role': 'candidate', 'name': user['name']})
            flash(f'Welcome back, {user["name"]}!', 'success')
            return redirect(url_for('candidate_dashboard'))
        flash('Invalid email or password.', 'error')

    return render_template('candidate_login.html', user=None, email=email)


# ── Candidate dashboard ───────────────────────────────────────────────────────

@app.route('/candidate/dashboard')
@candidate_required
def candidate_dashboard():
    db = get_db()
    profile = db.execute('SELECT * FROM candidate_profiles WHERE user_id=?',
                         [session['user_id']]).fetchone()
    my_skills = db.execute('''
        SELECT s.*, us.verified, us.score, us.added_at
        FROM user_skills us JOIN skills s ON us.skill_id = s.id
        WHERE us.user_id=? ORDER BY us.verified DESC, s.name
    ''', [session['user_id']]).fetchall()

    applications = db.execute('''
        SELECT a.*, j.title, j.location, j.job_type, rp.company AS company_name
        FROM applications a JOIN jobs j ON a.job_id = j.id
        JOIN recruiter_profiles rp ON j.recruiter_id = rp.user_id
        WHERE a.candidate_id=? ORDER BY a.applied_at DESC
    ''', [session['user_id']]).fetchall()

    recommended = db.execute('''
        SELECT j.*, rp.company AS company_name,
               (SELECT COUNT(*) FROM job_skills js
                JOIN user_skills us ON js.skill_id=us.skill_id
                WHERE js.job_id=j.id AND us.user_id=?) AS skill_match
        FROM jobs j JOIN recruiter_profiles rp ON j.recruiter_id=rp.user_id
        WHERE j.active=1
          AND j.id NOT IN (SELECT job_id FROM applications WHERE candidate_id=?)
        ORDER BY skill_match DESC, j.created_at DESC LIMIT 5
    ''', [session['user_id'], session['user_id']]).fetchall()

    return render_template('candidate_dashboard.html',
                           user=get_current_user(), profile=profile,
                           my_skills=my_skills, applications=applications,
                           recommended=recommended)


@app.route('/candidate/profile', methods=['GET', 'POST'])
@candidate_required
def candidate_profile():
    db = get_db()
    profile = db.execute('SELECT * FROM candidate_profiles WHERE user_id=?',
                         [session['user_id']]).fetchone()

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        headline = request.form.get('headline', '').strip()
        location = request.form.get('location', '').strip()
        bio = request.form.get('bio', '').strip()
        linkedin = request.form.get('linkedin', '').strip()
        github = request.form.get('github', '').strip()

        db.execute('UPDATE users SET name=? WHERE id=?', [name, session['user_id']])
        db.execute('''UPDATE candidate_profiles
                      SET headline=?, location=?, bio=?, linkedin=?, github=?
                      WHERE user_id=?''',
                   [headline, location, bio, linkedin, github, session['user_id']])
        db.commit()
        session['name'] = name
        flash('Profile updated!', 'success')
        return redirect(url_for('candidate_dashboard'))

    return render_template('candidate_profile.html', user=get_current_user(), profile=profile)


@app.route('/candidate/skills/remove/<int:skill_id>', methods=['POST'])
@candidate_required
def remove_skill(skill_id):
    db = get_db()
    db.execute('DELETE FROM user_skills WHERE user_id=? AND skill_id=?',
               [session['user_id'], skill_id])
    db.commit()
    flash('Skill removed.', 'success')
    return redirect(url_for('candidate_dashboard'))


# ── Apply ─────────────────────────────────────────────────────────────────────

@app.route('/jobs/<int:job_id>/apply', methods=['GET', 'POST'])
@candidate_required
def apply_job(job_id):
    db = get_db()
    job = db.execute('''
        SELECT j.*, rp.company AS company_name
        FROM jobs j JOIN recruiter_profiles rp ON j.recruiter_id=rp.user_id
        WHERE j.id=? AND j.active=1
    ''', [job_id]).fetchone()

    if not job:
        flash('Job not found.', 'error')
        return redirect(url_for('jobs'))

    if db.execute('SELECT id FROM applications WHERE job_id=? AND candidate_id=?',
                  [job_id, session['user_id']]).fetchone():
        flash('You already applied for this job.', 'warning')
        return redirect(url_for('job_detail', job_id=job_id))

    job_skills = db.execute('''
        SELECT s.* FROM job_skills js JOIN skills s ON js.skill_id=s.id WHERE js.job_id=?
    ''', [job_id]).fetchall()

    my_skills = {row['name']: row['verified'] for row in db.execute('''
        SELECT s.name, us.verified FROM user_skills us
        JOIN skills s ON us.skill_id=s.id WHERE us.user_id=?
    ''', [session['user_id']]).fetchall()}

    if request.method == 'POST':
        cover_letter = request.form.get('cover_letter', '').strip()
        db.execute('INSERT INTO applications (job_id, candidate_id, cover_letter) VALUES (?,?,?)',
                   [job_id, session['user_id'], cover_letter])
        db.commit()
        flash(f'Application submitted for {job["title"]}!', 'success')
        return redirect(url_for('candidate_dashboard'))

    return render_template('apply.html', job=job, job_skills=job_skills,
                           my_skills=my_skills, user=get_current_user())


# ── Recruiter auth ────────────────────────────────────────────────────────────

@app.route('/recruiter/signup', methods=['GET', 'POST'])
def recruiter_signup():
    if session.get('role') == 'recruiter':
        return redirect(url_for('recruiter_dashboard'))

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        company = request.form.get('company', '').strip()
        password = request.form.get('password', '')
        confirm = request.form.get('confirm_password', '')

        if not all([name, email, company, password, confirm]):
            flash('All fields are required.', 'error')
        elif password != confirm:
            flash('Passwords do not match.', 'error')
        elif len(password) < 6:
            flash('Password must be at least 6 characters.', 'error')
        elif get_db().execute('SELECT id FROM users WHERE email=?', [email]).fetchone():
            flash('An account with this email already exists.', 'error')
        else:
            db = get_db()
            cur = db.execute(
                'INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
                [name, email, generate_password_hash(password), 'recruiter']
            )
            db.execute('INSERT INTO recruiter_profiles (user_id, company) VALUES (?,?)',
                       [cur.lastrowid, company])
            db.commit()
            session.update({'user_id': cur.lastrowid, 'role': 'recruiter', 'name': name})
            flash(f'Welcome, {name}!', 'success')
            return redirect(url_for('recruiter_dashboard'))

    return render_template('recruiter_signup.html', user=None)


@app.route('/recruiter/login', methods=['GET', 'POST'])
def recruiter_login():
    if session.get('role') == 'recruiter':
        return redirect(url_for('recruiter_dashboard'))

    email = ''
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        user = get_db().execute(
            "SELECT * FROM users WHERE email=? AND role='recruiter'", [email]
        ).fetchone()
        if user and check_password_hash(user['password_hash'], password):
            session.update({'user_id': user['id'], 'role': 'recruiter', 'name': user['name']})
            flash(f'Welcome back, {user["name"]}!', 'success')
            return redirect(url_for('recruiter_dashboard'))
        flash('Invalid email or password.', 'error')

    return render_template('recruiter_login.html', user=None, email=email)


# ── Recruiter dashboard ───────────────────────────────────────────────────────

@app.route('/recruiter/dashboard')
@recruiter_required
def recruiter_dashboard():
    db = get_db()
    profile = db.execute('SELECT * FROM recruiter_profiles WHERE user_id=?',
                         [session['user_id']]).fetchone()
    my_jobs = db.execute('''
        SELECT j.*,
               (SELECT COUNT(*) FROM applications WHERE job_id=j.id) AS app_count
        FROM jobs j WHERE j.recruiter_id=? ORDER BY j.created_at DESC
    ''', [session['user_id']]).fetchall()

    recent_apps = db.execute('''
        SELECT a.*, j.title AS job_title, u.name AS candidate_name, u.email AS candidate_email
        FROM applications a JOIN jobs j ON a.job_id=j.id
        JOIN users u ON a.candidate_id=u.id
        WHERE j.recruiter_id=? ORDER BY a.applied_at DESC LIMIT 10
    ''', [session['user_id']]).fetchall()

    total_apps = sum(j['app_count'] for j in my_jobs)
    new_apps = db.execute('''
        SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id=j.id
        WHERE j.recruiter_id=? AND a.status='applied'
    ''', [session['user_id']]).fetchone()[0]

    stats = {
        'total_jobs': len(my_jobs),
        'active_jobs': sum(1 for j in my_jobs if j['active']),
        'total_applications': total_apps,
        'new_applications': new_apps,
    }
    return render_template('recruiter_dashboard.html',
                           user=get_current_user(), profile=profile,
                           my_jobs=my_jobs, recent_apps=recent_apps, stats=stats)


@app.route('/recruiter/post-job', methods=['GET', 'POST'])
@recruiter_required
def post_job():
    db = get_db()
    all_skills = db.execute('SELECT * FROM skills ORDER BY category, name').fetchall()
    profile = db.execute('SELECT * FROM recruiter_profiles WHERE user_id=?',
                         [session['user_id']]).fetchone()

    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        location = request.form.get('location', '').strip()
        job_type = request.form.get('job_type', 'Full-time')
        description = request.form.get('description', '').strip()
        requirements = request.form.get('requirements', '').strip()
        salary_min = request.form.get('salary_min', 0, type=int)
        salary_max = request.form.get('salary_max', 0, type=int)
        skill_ids = request.form.getlist('skills', type=int)

        if not all([title, location, description]):
            flash('Title, location, and description are required.', 'error')
            return render_template('post_job.html', user=get_current_user(),
                                   all_skills=all_skills, profile=profile)

        cur = db.execute('''
            INSERT INTO jobs (recruiter_id, title, company, location, job_type,
                              description, requirements, salary_min, salary_max)
            VALUES (?,?,?,?,?,?,?,?,?)
        ''', [session['user_id'], title, profile['company'], location, job_type,
              description, requirements, salary_min, salary_max])
        job_id = cur.lastrowid
        for sid in skill_ids:
            db.execute('INSERT OR IGNORE INTO job_skills (job_id, skill_id) VALUES (?,?)',
                       [job_id, sid])
        db.commit()
        flash(f'"{title}" posted successfully!', 'success')
        return redirect(url_for('recruiter_dashboard'))

    return render_template('post_job.html', user=get_current_user(),
                           all_skills=all_skills, profile=profile)


@app.route('/recruiter/jobs/<int:job_id>/toggle', methods=['POST'])
@recruiter_required
def toggle_job(job_id):
    db = get_db()
    job = db.execute('SELECT * FROM jobs WHERE id=? AND recruiter_id=?',
                     [job_id, session['user_id']]).fetchone()
    if job:
        db.execute('UPDATE jobs SET active=? WHERE id=?', [0 if job['active'] else 1, job_id])
        db.commit()
        flash('Job status updated.', 'success')
    return redirect(url_for('recruiter_dashboard'))


@app.route('/recruiter/jobs/<int:job_id>/applications')
@recruiter_required
def job_applications(job_id):
    db = get_db()
    job = db.execute('SELECT * FROM jobs WHERE id=? AND recruiter_id=?',
                     [job_id, session['user_id']]).fetchone()
    if not job:
        flash('Job not found.', 'error')
        return redirect(url_for('recruiter_dashboard'))

    raw_apps = db.execute('''
        SELECT a.*, u.name AS candidate_name, u.email AS candidate_email,
               cp.headline, cp.location AS candidate_location, cp.linkedin, cp.github,
               (SELECT GROUP_CONCAT(s.name||':'||us.verified, ',')
                FROM user_skills us JOIN skills s ON us.skill_id=s.id
                WHERE us.user_id=a.candidate_id) AS skills_data
        FROM applications a JOIN users u ON a.candidate_id=u.id
        LEFT JOIN candidate_profiles cp ON a.candidate_id=cp.user_id
        WHERE a.job_id=? ORDER BY a.applied_at DESC
    ''', [job_id]).fetchall()

    applications = []
    for a in raw_apps:
        d = dict(a)
        d['skills'] = parse_skills_data(a['skills_data'])[:8]
        applications.append(d)

    return render_template('job_applications.html', job=job,
                           applications=applications, user=get_current_user())


@app.route('/recruiter/applications/<int:app_id>/status', methods=['POST'])
@recruiter_required
def update_app_status(app_id):
    status = request.form.get('status')
    if status not in ('applied', 'reviewing', 'shortlisted', 'rejected'):
        flash('Invalid status.', 'error')
        return redirect(url_for('recruiter_dashboard'))

    db = get_db()
    row = db.execute('''
        SELECT a.job_id FROM applications a JOIN jobs j ON a.job_id=j.id
        WHERE a.id=? AND j.recruiter_id=?
    ''', [app_id, session['user_id']]).fetchone()

    if row:
        db.execute('UPDATE applications SET status=? WHERE id=?', [status, app_id])
        db.commit()
        flash('Status updated.', 'success')
        return redirect(url_for('job_applications', job_id=row['job_id']))

    flash('Application not found.', 'error')
    return redirect(url_for('recruiter_dashboard'))


@app.route('/recruiter/candidates')
@recruiter_required
def search_candidates():
    db = get_db()
    search = request.args.get('q', '').strip()
    skill_filter = request.args.get('skill', '').strip()
    location_filter = request.args.get('location', '').strip()
    verified_only = request.args.get('verified', '') == '1'

    query = '''
        SELECT DISTINCT u.id, u.name, u.email, u.created_at,
               cp.headline, cp.location,
               (SELECT COUNT(*) FROM user_skills WHERE user_id=u.id AND verified=1) AS verified_count,
               (SELECT COUNT(*) FROM user_skills WHERE user_id=u.id) AS total_skills,
               (SELECT GROUP_CONCAT(s.name||':'||us.verified, ',')
                FROM user_skills us JOIN skills s ON us.skill_id=s.id
                WHERE us.user_id=u.id ORDER BY us.verified DESC LIMIT 8) AS skills_data
        FROM users u LEFT JOIN candidate_profiles cp ON u.id=cp.user_id
        WHERE u.role='candidate'
    '''
    params = []
    if search:
        query += ' AND (u.name LIKE ? OR cp.headline LIKE ? OR cp.bio LIKE ?)'
        params += [f'%{search}%', f'%{search}%', f'%{search}%']
    if location_filter:
        query += ' AND cp.location LIKE ?'
        params.append(f'%{location_filter}%')
    if skill_filter:
        query += ''' AND u.id IN (
            SELECT us.user_id FROM user_skills us JOIN skills s ON us.skill_id=s.id
            WHERE s.name LIKE ?)'''
        params.append(f'%{skill_filter}%')
    if verified_only:
        query += ' AND (SELECT COUNT(*) FROM user_skills WHERE user_id=u.id AND verified=1) > 0'
    query += ' ORDER BY verified_count DESC, u.created_at DESC'

    raw = db.execute(query, params).fetchall()
    candidates = []
    for c in raw:
        d = dict(c)
        d['skills'] = parse_skills_data(c['skills_data'])[:6]
        candidates.append(d)

    all_skills = db.execute('SELECT * FROM skills ORDER BY name').fetchall()
    return render_template('candidates.html', candidates=candidates,
                           all_skills=all_skills, search=search,
                           skill_filter=skill_filter, location_filter=location_filter,
                           verified_only=verified_only, user=get_current_user())


# ── Logout ────────────────────────────────────────────────────────────────────

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    flash('You have been logged out.', 'success')
    return redirect(url_for('home'))


# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='127.0.0.1', port=5000)
