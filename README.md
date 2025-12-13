# DocMedaa – Smart Patient Portal & Healthcare Companion

## Overview
DocMedaa is a comprehensive healthcare platform designed to streamline communication between patients and healthcare providers while enabling proactive health management. The system brings together appointment management, secure messaging, medical document handling, educational resources, and wearable health data into a single unified interface.

By reducing fragmentation across healthcare applications, DocMedaa improves patient engagement, enhances provider visibility into patient behavior, and supports informed healthcare decision-making.

---

## Motivation
Modern healthcare systems often rely on multiple disconnected tools, making it difficult for patients to manage appointments, track health data, and communicate effectively with providers. DocMedaa addresses these challenges by centralizing critical healthcare interactions within one platform, promoting transparency, efficiency, and continuity of care.

---

## Key Features

### Patient Features
- Secure authentication and role-based access
- Personalized dashboard for healthcare management
- Appointment scheduling, tracking, and automated reminders
- Secure patient–doctor messaging
- Uploading and secure access to medical documents
- Access to curated educational health resources
- Smartwatch-based activity and heart-rate tracking via Google Fit API

### Doctor Features
- Structured dashboards for patient management
- Appointment approval and scheduling
- Secure communication with patients
- Review of uploaded medical records
- Monitoring summarized wearable health data
- AI-assisted care plan generation (prototype)

### Administrator Features
- User and role management
- System monitoring and oversight
- Content management and configuration
- Enforcement of data integrity and access control policies

---

## Technology Stack
- **Frontend:** React  
- **Backend:** Node.js  
- **Database:** MongoDB  
- **APIs:** Google Fit API  
- **Authentication:** JWT-based authentication  
- **Deployment:** Google Cloud  
- **CI/CD:** GitHub Actions  

---

## System Architecture
DocMedaa follows a modular client–server architecture that separates frontend, backend, and data layers. The React frontend communicates with a Node.js backend through RESTful APIs, while MongoDB provides secure and scalable data storage. JWT-based authentication and role-based authorization protect sensitive healthcare data.

---

## Setup Instructions

### Prerequisites
- Node.js (version 16 or higher)
- MongoDB (local or cloud instance)
- Google Fit API credentials
- GitHub account

### Installation Steps
1. Clone the project repository from GitHub.
2. Install backend dependencies and configure environment variables.
3. Start the backend server.
4. Install frontend dependencies.
5. Run the React frontend in a local development environment.
6. Access the admin panel through the React interface.

> **Note:** This project is currently configured for academic demonstration and prototype purposes.

---

## Testing and Quality Assurance
- Functional testing of authentication, appointments, and messaging
- Backend unit tests implemented using pytest with mocked services
- Continuous integration configured using GitHub Actions
- Manual end-to-end testing across patient and doctor workflows

---

## Limitations
- Uses sample or simulated healthcare data
- Smartwatch integration limited to basic activity and heart-rate metrics
- Application is not deployed to public app stores
- AI-assisted care plans are implemented at a prototype level

---

## Future Enhancements
- Integration with Electronic Health Record (EHR) systems
- Support for additional wearable metrics such as sleep and oxygen saturation
- AI-driven personalized health insights
- Predictive analytics for appointment adherence
- Improved accessibility and user customization
- Full-scale cloud deployment and public release on app stores

---

## Team Contributions
- **Dhruv Patel** 
- **Prutha Trivedi** 
- **Khushi Patel** 
- **Dhanisha Raut**
- **Nicholas Obiso**   

---

## Conclusion
DocMedaa demonstrates the successful application of modern software engineering principles to a real-world healthcare problem. Through thoughtful system design, secure data handling, and user-centered workflows, the platform provides a scalable foundation for future digital healthcare solutions.
ovides a scalable foundation for future digital healthcare solutions.

