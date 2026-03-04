#!/bin/bash

# Login first
curl -s -c /tmp/job_cookies.txt -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"test123"}' > /dev/null

echo "🚀 Migrating jobs to dashboard..."

# Function to add job
add_job() {
  curl -s -b /tmp/job_cookies.txt -X POST http://localhost:3001/api/jobs \
    -H "Content-Type: application/json" \
    -d "$1" | grep -q '"id"' && echo "✅ Added: $2" || echo "❌ Failed: $2"
}

# Google DeepMind - Research Engineer, Applied Robotics
add_job '{
  "company": "Google DeepMind",
  "role": "Research Engineer, Applied Robotics",
  "location": "Mountain View, CA",
  "posting_url": "https://www.linkedin.com/jobs/view/4363540578",
  "salary_range": "$166K-$244K/yr",
  "priority": "P0",
  "status": "discovered",
  "notes": "Google team matching alignment; applied robotics focus",
  "tags": ["robotics", "ml", "us", "google"],
  "source": "heartbeat"
}' "Google DeepMind - Research Engineer, Applied Robotics"

# Google DeepMind - Research Engineer, Developer Experience, Gemini Robotics
add_job '{
  "company": "Google DeepMind",
  "role": "Research Engineer, Developer Experience, Gemini Robotics",
  "location": "Mountain View, CA",
  "posting_url": "https://www.linkedin.com/jobs/view/4379210814",
  "salary_range": "$166K-$244K/yr",
  "priority": "P0",
  "status": "discovered",
  "notes": "Gemini Robotics focus; team matching alignment",
  "tags": ["robotics", "ml", "us", "google", "gemini"],
  "source": "heartbeat"
}' "Google DeepMind - Gemini Robotics"

# Amazon - Applied Scientist, FAR
add_job '{
  "company": "Amazon",
  "role": "Applied Scientist, FAR (Frontier AI & Robotics)",
  "location": "San Francisco, CA",
  "posting_url": "https://www.linkedin.com/jobs/view/4362349178",
  "priority": "P0",
  "status": "discovered",
  "notes": "Frontier AI + Robotics; matches Siemens AI R&D trajectory",
  "tags": ["robotics", "ml", "us", "research"],
  "source": "heartbeat"
}' "Amazon - FAR"

# Amazon - Advanced Robotics Controls Engineer
add_job '{
  "company": "Amazon",
  "role": "Advanced Robotics Controls Engineer, FAR",
  "location": "San Francisco, CA",
  "posting_url": "https://www.linkedin.com/jobs/view/4364056012",
  "priority": "P0",
  "status": "discovered",
  "notes": "1,887 alumni connections; matches Siemens R&D",
  "tags": ["robotics", "controls", "us"],
  "source": "heartbeat"
}' "Amazon - Advanced Robotics Controls"

# Boston Dynamics - Robotics Engineer
add_job '{
  "company": "Boston Dynamics",
  "role": "Robotics Engineer - Software and Controls",
  "location": "Billerica, MA",
  "posting_url": "https://www.linkedin.com/jobs/view/4333228857",
  "salary_range": "$131,763 - $208,015/yr",
  "priority": "P1",
  "status": "discovered",
  "notes": "Real-time systems for humanoid/advanced robots",
  "tags": ["robotics", "controls", "us", "humanoid"],
  "source": "manual"
}' "Boston Dynamics - Robotics Engineer"

# Boston Dynamics - Senior Robotics Software Engineer, Atlas
add_job '{
  "company": "Boston Dynamics",
  "role": "Senior Robotics Software Engineer, Atlas Controls",
  "location": "Billerica, MA",
  "posting_url": "https://bostondynamics.wd1.myworkdayjobs.com/en-US/Boston_Dynamics/job/Senior-Robotics-Software-Engineer_R2178-1",
  "priority": "P1",
  "status": "discovered",
  "notes": "Core software infrastructure for Atlas control system",
  "tags": ["robotics", "controls", "us", "atlas"],
  "source": "manual"
}' "Boston Dynamics - Atlas Controls"

# Tesla - Software Engineer, Robotics Integrations
add_job '{
  "company": "Tesla",
  "role": "Software Engineer, Robotics Integrations",
  "location": "Austin, TX",
  "posting_url": "https://www.linkedin.com/jobs/view/4299106369",
  "priority": "P1",
  "status": "discovered",
  "notes": "Fleet management and robot control (AMRs, Optimus)",
  "tags": ["robotics", "us", "tesla", "optimus"],
  "source": "manual"
}' "Tesla - Robotics Integrations"

# Tesla - Robotics Software Engineer, Optimus Connectivity
add_job '{
  "company": "Tesla",
  "role": "Robotics Software Engineer, Optimus Connectivity",
  "location": "Not specified",
  "posting_url": "https://www.tesla.com/careers/search/job/robotics-software-engineer-optimus-connectivity-234524",
  "priority": "P1",
  "status": "discovered",
  "notes": "Embedded software for wireless systems (LTE, 5G, Wi-Fi)",
  "tags": ["robotics", "embedded", "us", "tesla", "optimus"],
  "source": "manual"
}' "Tesla - Optimus Connectivity"

# NVIDIA - Senior AI Research Scientist, Robotics Digital Twins
add_job '{
  "company": "NVIDIA",
  "role": "Senior AI Research Scientist, Robotics Digital Twins",
  "location": "Santa Clara, CA",
  "posting_url": "https://www.linkedin.com/jobs/view/4379214192",
  "priority": "P1",
  "status": "discovered",
  "notes": "Digital twins + robotics research; 276 alumni",
  "tags": ["robotics", "ml", "us", "research"],
  "source": "heartbeat"
}' "NVIDIA - Digital Twins"

# Apple - ML Research Scientist
add_job '{
  "company": "Apple",
  "role": "ML Research Scientist",
  "location": "Santa Clara, CA",
  "posting_url": "https://www.linkedin.com/jobs/view/4377650327",
  "priority": "P1",
  "status": "discovered",
  "notes": "614 alumni connections",
  "tags": ["ml", "us", "research"],
  "source": "heartbeat"
}' "Apple - ML Research"

# Edison Smart - Robotics Computer Vision Engineer
add_job '{
  "company": "Edison Smart",
  "role": "Robotics Computer Vision Engineer",
  "location": "Chicago, IL",
  "posting_url": "https://www.linkedin.com/jobs/view/4368822310",
  "priority": "P1",
  "status": "discovered",
  "notes": "Direct CV match: YOLO, OpenCV, real-time vision systems",
  "tags": ["robotics", "cv", "us", "yolo"],
  "source": "heartbeat"
}' "Edison Smart - CV"

# FieldAI - Robotics AI Engineer
add_job '{
  "company": "FieldAI",
  "role": "Robotics AI Engineer – Calibration, Localization, and Mapping",
  "location": "Irvine, CA",
  "posting_url": "https://www.linkedin.com/jobs/view/4368840132",
  "priority": "P1",
  "status": "discovered",
  "notes": "SLAM experience from RoboMop project",
  "tags": ["robotics", "slam", "us", "cv"],
  "source": "heartbeat"
}' "FieldAI - SLAM"

# Prehensio - Object Localization
add_job '{
  "company": "Prehensio GmbH",
  "role": "Robotics Engineer – Object Localization & Perception",
  "location": "Heilbronn, Germany",
  "posting_url": "https://www.linkedin.com/jobs/view/1010019866823",
  "salary_range": "€50-80k",
  "priority": "P1",
  "status": "discovered",
  "notes": "Perfect match: Vision + robotics; EU location",
  "tags": ["robotics", "cv", "germany", "eu"],
  "source": "heartbeat"
}' "Prehensio - Object Localization"

# Prehensio - Grasp Planning
add_job '{
  "company": "Prehensio GmbH",
  "role": "Robotics Engineer - Grasp Planning",
  "location": "Heilbronn, Germany",
  "posting_url": "https://www.linkedin.com/jobs/view/1010019741221",
  "salary_range": "€50-80k",
  "priority": "P1",
  "status": "discovered",
  "notes": "Matches IK/robotics from Siemens & RobotArm",
  "tags": ["robotics", "ik", "germany", "eu"],
  "source": "heartbeat"
}' "Prehensio - Grasp Planning"

# Applied Intuition - Research Engineer
add_job '{
  "company": "Applied Intuition",
  "role": "Research Engineer - Robot Learning",
  "location": "Sunnyvale, CA",
  "posting_url": "https://www.linkedin.com/jobs/view/4288108694",
  "priority": "P2",
  "status": "discovered",
  "notes": "Robot learning; 7 school alumni",
  "tags": ["robotics", "ml", "us", "research"],
  "source": "heartbeat"
}' "Applied Intuition - Robot Learning"

# General Motors - Senior Research Scientist
add_job '{
  "company": "General Motors",
  "role": "Senior Research Scientist",
  "location": "Sunnyvale, CA",
  "posting_url": "https://www.linkedin.com/jobs/view/4369688093",
  "priority": "P2",
  "status": "discovered",
  "notes": "Automotive robotics research",
  "tags": ["robotics", "us", "automotive"],
  "source": "heartbeat"
}' "GM - Senior Research"

echo ""
echo "✅ Migration complete!"
rm -f /tmp/job_cookies.txt
