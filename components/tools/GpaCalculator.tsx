'use client';

import { useMemo, useState } from 'react';

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0.0,
};

const GRADES = Object.keys(GRADE_POINTS);

interface Course {
  id: string;
  name: string;
  credits: string;
  grade: string;
}

let nextId = 4;
function makeId(): string {
  return `c${nextId++}`;
}

const INITIAL_COURSES: Course[] = [
  { id: 'c1', name: 'Introduction to Biology', credits: '3', grade: 'A' },
  { id: 'c2', name: 'College Algebra', credits: '4', grade: 'B+' },
  { id: 'c3', name: 'World History', credits: '3', grade: 'A-' },
];

export default function GpaCalculator() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);

  function addCourse() {
    setCourses((prev) => [...prev, { id: makeId(), name: '', credits: '3', grade: 'A' }]);
  }

  function removeCourse(id: string) {
    setCourses((prev) => (prev.length <= 1 ? prev : prev.filter((c) => c.id !== id)));
  }

  function updateCourse(id: string, patch: Partial<Course>) {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  const result = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    let hasInvalid = false;

    for (const course of courses) {
      const credits = Number(course.credits);
      if (!Number.isFinite(credits) || credits <= 0) {
        hasInvalid = true;
        continue;
      }
      totalPoints += GRADE_POINTS[course.grade] * credits;
      totalCredits += credits;
    }

    if (totalCredits === 0) return { ok: false as const, message: 'Add at least one course with valid credit hours.' };

    return {
      ok: true as const,
      gpa: totalPoints / totalCredits,
      totalCredits,
      hasInvalid,
    };
  }, [courses]);

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Courses</span>
          <div className="panel-actions">
            <button className="icon-btn" onClick={addCourse}>
              Add course
            </button>
          </div>
        </div>
        <div style={{ padding: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Course name', 'Credit hours', 'Grade', ''].map((h) => (
                  <th
                    key={h}
                    className="mono"
                    style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-tertiary)', padding: '4px 8px', borderBottom: '1px solid var(--border)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td style={{ padding: '4px 8px', borderBottom: '1px solid var(--border)' }}>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateCourse(c.id, { name: e.target.value })}
                      placeholder="Course name"
                      className="mono"
                      style={{
                        width: '100%',
                        minWidth: 160,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        color: 'var(--text-primary)',
                        padding: '6px 8px',
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 8px', borderBottom: '1px solid var(--border)' }}>
                    <input
                      type="number"
                      min={0.5}
                      max={12}
                      step={0.5}
                      value={c.credits}
                      onChange={(e) => updateCourse(c.id, { credits: e.target.value })}
                      className="mono"
                      style={{
                        width: 70,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        color: 'var(--text-primary)',
                        padding: '6px 8px',
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 8px', borderBottom: '1px solid var(--border)' }}>
                    <select
                      value={c.grade}
                      onChange={(e) => updateCourse(c.id, { grade: e.target.value })}
                      className="mono"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        color: 'var(--text-primary)',
                        padding: '6px 8px',
                      }}
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g} ({GRADE_POINTS[g].toFixed(1)})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '4px 8px', borderBottom: '1px solid var(--border)' }}>
                    <button className="icon-btn" onClick={() => removeCourse(c.id)} disabled={courses.length <= 1}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {result.ok ? (
        <div className="panel" style={{ padding: '24px 20px', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Overall GPA ({result.totalCredits} credit hours)
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, marginTop: 6 }}>
            {result.gpa.toFixed(2)}
          </div>
          {result.hasInvalid && (
            <div className="status-line status-invalid" style={{ marginTop: 8 }}>
              ✗ One or more rows have invalid credit hours and were excluded from the calculation.
            </div>
          )}
        </div>
      ) : (
        <div className="status-line status-invalid">✗ {result.message}</div>
      )}
    </div>
  );
}
