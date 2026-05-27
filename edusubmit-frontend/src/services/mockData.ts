/**
 * Mock data service for development and testing
 * Provides sample data when backend APIs are not available
 */

export interface MockExam {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'submitted';
  requirements?: string;
  teacherFiles?: Array<{
    id: string;
    name: string;
    url: string;
    size: string;
  }>;
}

export interface MockStudentProfile {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: string;
  avatar?: string;
}

export const mockStudentProfile: MockStudentProfile = {
  id: '1',
  name: 'Student User',
  email: 'student@gmail.com',
  studentId: 'STU000001',
  role: 'STUDENT'
};

export const mockExams: MockExam[] = [
  {
    id: '1',
    title: 'Machine Learning Project',
    description: 'Build a classification model using Python and scikit-learn',
    deadline: '2024-03-25T23:59:59',
    status: 'pending',
    requirements: `1. Choose a dataset from the provided options
2. Implement at least 2 different classification algorithms
3. Compare performance metrics
4. Submit a Jupyter notebook with code and results
5. Include a brief report explaining your methodology

The project should demonstrate understanding of:
- Data preprocessing and feature engineering
- Model selection and hyperparameter tuning
- Evaluation metrics and cross-validation
- Proper documentation and code organization`,
    teacherFiles: [
      {
        id: '1',
        name: 'ML_Project_Guidelines.pdf',
        url: '/files/ml-guidelines.pdf',
        size: '2.3 MB'
      },
      {
        id: '2',
        name: 'Sample_Dataset.csv',
        url: '/files/sample-data.csv',
        size: '856 KB'
      }
    ]
  },
  {
    id: '2',
    title: 'Web Development Assignment',
    description: 'Create a responsive e-commerce website using React and Tailwind CSS',
    deadline: '2024-03-28T23:59:59',
    status: 'pending',
    requirements: `1. Build a responsive homepage with product listings
2. Implement product detail pages
3. Create a shopping cart functionality
4. Add user authentication (login/register)
5. Make it fully responsive for mobile and desktop

Requirements:
- Use React with TypeScript
- Use Tailwind CSS for styling
- Include proper state management
- Add form validation
- Ensure accessibility standards
- Deploy to a live server`,
    teacherFiles: [
      {
        id: '3',
        name: 'Web_Assignment_Requirements.pdf',
        url: '/files/web-requirements.pdf',
        size: '1.2 MB'
      }
    ]
  },
  {
    id: '3',
    title: 'Database Design',
    description: 'Design an ER diagram and create database schema for an online bookstore',
    deadline: '2024-03-22T23:59:59',
    status: 'submitted',
    requirements: `1. Design entities and relationships
2. Create ER diagram using proper notation
3. Write SQL DDL statements
4. Include normalization up to 3NF
5. Add sample data and queries

Deliverables:
- ER diagram (draw.io or similar tool)
- SQL schema file
- Documentation explaining design choices
- Sample queries for common operations`,
    teacherFiles: [
      {
        id: '4',
        name: 'Database_Requirements.pdf',
        url: '/files/db-requirements.pdf',
        size: '3.1 MB'
      },
      {
        id: '5',
        name: 'ER_Diagram_Template.drawio',
        url: '/files/er-template.drawio',
        size: '245 KB'
      }
    ]
  }
];

/**
 * Simulate API delay for realistic loading states
 */
export const simulateApiDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));
