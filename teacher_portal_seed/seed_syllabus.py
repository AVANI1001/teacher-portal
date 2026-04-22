import mysql.connector

# Connect to your XAMPP MySQL database
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",  # leave empty if no password
    port=3307,
    database="teacher_portal"
)
cursor = conn.cursor()

# Example syllabus data
syllabus = {
    "CBSE": {
        "Class 6": {
            "Mathematics": [
                {"chapter": "Knowing Our Numbers", "topics": ["Large Numbers", "Comparisons"]},
                {"chapter": "Whole Numbers", "topics": ["Properties", "Patterns"]},
                {"chapter": "Fractions", "topics": ["Simplifying Fractions", "Operations"]}
            ],
            "Science": [
                {"chapter": "Food: Where Does It Come From?", "topics": ["Sources of Food", "Food Variety"]},
                {"chapter": "Components of Food", "topics": ["Carbohydrates", "Proteins", "Fats"]}
            ]
        },
        "Class 7": {
            "Mathematics": [
                {"chapter": "Integers", "topics": ["Addition of Integers", "Subtraction of Integers"]},
                {"chapter": "Fractions and Decimals", "topics": ["Simplifying Fractions", "Decimal Operations"]}
            ],
            "Science": [
                {"chapter": "Nutrition in Plants", "topics": ["Photosynthesis", "Saprotrophic Nutrition"]},
                {"chapter": "Nutrition in Animals", "topics": ["Digestion in Humans", "Digestion in Amoeba"]}
            ]
        },
        "Class 8": {
            "Mathematics": [
                {"chapter": "Rational Numbers", "topics": ["Properties", "Representation"]},
                {"chapter": "Linear Equations", "topics": ["Solving Equations", "Applications"]}
            ],
            "Science": [
                {"chapter": "Crop Production", "topics": ["Agricultural Practices", "Fertilizers"]},
                {"chapter": "Microorganisms", "topics": ["Useful Microbes", "Harmful Microbes"]}
            ]
        },
        "Class 9": {
            "Mathematics": [
                {"chapter": "Polynomials", "topics": ["Factorization", "Zeros of Polynomials"]},
                {"chapter": "Coordinate Geometry", "topics": ["Cartesian Plane", "Plotting Points"]}
            ],
            "Science": [
                {"chapter": "Matter in Our Surroundings", "topics": ["States of Matter", "Change of State"]},
                {"chapter": "Atoms and Molecules", "topics": ["Laws of Chemical Combination", "Molecular Structure"]}
            ]
        },
        "Class 10": {
            "Mathematics": [
                {"chapter": "Real Numbers", "topics": ["Euclid’s Division Lemma", "Fundamental Theorem of Arithmetic"]},
                {"chapter": "Quadratic Equations", "topics": ["Factorization Method", "Completing the Square"]}
            ],
            "Science": [
                {"chapter": "Chemical Reactions", "topics": ["Types of Reactions", "Balancing Equations"]},
                {"chapter": "Acids, Bases and Salts", "topics": ["Properties", "Uses"]}
            ]
        },
        "Class 11": {
            "Mathematics": [
                {"chapter": "Sets", "topics": ["Representation of Sets", "Operations on Sets"]},
                {"chapter": "Trigonometric Functions", "topics": ["Domain and Range", "Graphs"]}
            ],
            "Physics": [
                {"chapter": "Physical World", "topics": ["Scope of Physics", "Nature of Physical Laws"]},
                {"chapter": "Units and Measurements", "topics": ["SI Units", "Errors in Measurement"]}
            ]
        },
        "Class 12": {
            "Mathematics": [
                {"chapter": "Relations and Functions", "topics": ["Types of Relations", "Inverse Functions"]},
                {"chapter": "Matrices", "topics": ["Types of Matrices", "Determinants"]}
            ],
            "Physics": [
                {"chapter": "Electrostatics", "topics": ["Coulomb’s Law", "Electric Field"]},
                {"chapter": "Current Electricity", "topics": ["Ohm’s Law", "Resistivity"]}
            ]
        }
    },
    "GSEB": {
        "Class 12": {
            "Mathematics": [
                {"chapter": "Probability", "topics": ["Conditional Probability", "Bayes Theorem"]},
                {"chapter": "Vectors", "topics": ["Dot Product", "Cross Product"]}
            ],
            "Physics": [
                {"chapter": "Magnetism", "topics": ["Magnetic Field", "Electromagnetic Induction"]},
                {"chapter": "Optics", "topics": ["Reflection", "Refraction"]}
            ]
        }
    }
}

           # Define subject-specific questions once
questions_by_subject = {
    "Mathematics": [
        ("Simplify: (x+3)(x-3).", 2.0, 1),
        ("Solve: 2x + 5 = 15.", 2.0, 1),
        ("Explain Pythagoras theorem with proof.", 5.0, 3)
    ],
    "Science": [
        ("Explain photosynthesis with a diagram.", 5.0, 3),
        ("What are carbohydrates? Give examples.", 2.0, 1),
        ("Describe the digestive system in humans.", 3.0, 2)
    ],
    "Physics": [
        ("State Coulomb’s Law with formula.", 2.0, 1),
        ("Explain Ohm’s Law with circuit diagram.", 3.0, 2),
        ("Derive the equation of motion using calculus.", 5.0, 3)
    ],
    "Chemistry": [
        ("Balance the equation: H2 + O2 → H2O.", 2.0, 1),
        ("Explain Mendeleev’s periodic table.", 3.0, 2),
        ("Describe ionic and covalent bonding.", 5.0, 3)
    ],
    "Biology": [
        ("Draw and label the human heart.", 5.0, 3),
        ("What are enzymes? Give examples.", 2.0, 1),
        ("Explain the process of respiration.", 3.0, 2)
    ]
}

# Insert into DB
for board, classes in syllabus.items():
    cursor.execute("SELECT board_id FROM boards WHERE board_name=%s", (board,))
    result = cursor.fetchone()
    if result is None:
        cursor.execute("INSERT INTO boards (board_name, board_code, state, country, is_active) VALUES (%s, %s, %s, %s, 1)",
                       (board, f"{board[:4].upper()}_{len(board)}", "Delhi", "India"))
        board_id = cursor.lastrowid
    else:
        board_id = result[0]

    for class_name, subjects in classes.items():
        class_number = int(class_name.split()[1])
        cursor.execute("SELECT class_id FROM classes WHERE board_id=%s AND class_number=%s",
                       (board_id, class_number))
        result = cursor.fetchone()
        if result is None:
            cursor.execute("INSERT INTO classes (board_id, class_name, class_number, is_active) VALUES (%s, %s, %s, 1)",
                           (board_id, class_name, class_number))
            class_id = cursor.lastrowid
        else:
            class_id = result[0]

        for subject_name, chapters in subjects.items():
            cursor.execute("SELECT subject_id FROM subjects WHERE board_id=%s AND class_id=%s AND subject_name=%s",
                           (board_id, class_id, subject_name))
            result = cursor.fetchone()
            if result is None:
                cursor.execute("INSERT INTO subjects (board_id, class_id, subject_name, subject_code, language, is_active) VALUES (%s, %s, %s, %s, %s, 1)",
                               (board_id, class_id, subject_name, subject_name[:4].upper(), "English"))
                subject_id = cursor.lastrowid
            else:
                subject_id = result[0]

            for ch_num, ch in enumerate(chapters, start=1):
                cursor.execute("SELECT chapter_id FROM chapters WHERE subject_id=%s AND chapter_number=%s",
                               (subject_id, ch_num))
                result = cursor.fetchone()
                if result is None:
                    cursor.execute("INSERT INTO chapters (subject_id, chapter_number, chapter_name, total_topics, is_active) VALUES (%s, %s, %s, %s, 1)",
                                   (subject_id, ch_num, ch["chapter"], len(ch["topics"])))
                    chapter_id = cursor.lastrowid
                else:
                    chapter_id = result[0]

                for t_num, topic in enumerate(ch["topics"], start=1):
                    cursor.execute("SELECT topic_id FROM topics WHERE chapter_id=%s AND topic_number=%s",
                                   (chapter_id, t_num))
                    result = cursor.fetchone()
                    if result is None:
                        cursor.execute("INSERT INTO topics (chapter_id, topic_number, topic_name, is_active) VALUES (%s, %s, %s, 1)",
                                       (chapter_id, t_num, topic))
                        topic_id = cursor.lastrowid
                    else:
                        topic_id = result[0]

                    # ✅ Insert sample questions for each topic
         
                  # Inside your topic loop:
                    questions = questions_by_subject.get(subject_name, [])
                    for q_text, marks, difficulty in questions:
                        cursor.execute(
                           "SELECT question_id FROM question_bank WHERE topic_id=%s AND question_text=%s",
                            (topic_id, q_text)
                        )
                        if cursor.fetchone() is None:  # ✅ prevents duplicates
                            cursor.execute(
                            "INSERT INTO question_bank (chapter_id, topic_id, section_id, difficulty_id, question_text, marks, added_by, is_active) VALUES (%s, %s, %s, %s, %s, %s, %s, 1)",
                            (chapter_id, topic_id, 2, difficulty, q_text, marks, "system")
                        )

conn.commit()
cursor.close()
conn.close()
print("Data inserted successfully!")
