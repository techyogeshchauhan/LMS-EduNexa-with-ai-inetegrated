import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Phone, Hash, Building, GraduationCap, Upload, Camera, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface RegisterFormProps {
  onToggleForm: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Student-specific fields
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  
  // Teacher-specific fields
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();

  // Define steps based on role
  const getSteps = () => {
    const baseSteps = [
      { id: 1, title: 'Role Selection', description: 'Choose your role' },
      { id: 2, title: 'Basic Info', description: 'Personal details' },
      { id: 3, title: 'Account Security', description: 'Password setup' }
    ];

    if (role === 'student') {
      return [
        ...baseSteps,
        { id: 4, title: 'Academic Info', description: 'Student details' },
        { id: 5, title: 'Profile Picture', description: 'Optional photo' }
      ];
    } else if (role === 'teacher') {
      return [
        ...baseSteps,
        { id: 4, title: 'Professional Info', description: 'Faculty details' },
        { id: 5, title: 'Profile Picture', description: 'Optional photo' }
      ];
    } else {
      return [
        ...baseSteps,
        { id: 4, title: 'Profile Picture', description: 'Optional photo' }
      ];
    }
  };

  const steps = getSteps();
  const totalSteps = steps.length;

  const departments = [
    'Computer Science',
    'Data Science',
    'Information Technology',
    'Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration',
    'Mathematics',
    'Physics',
    'Chemistry'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year'];
  const semesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];
  
  const designations = [
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Lecturer',
    'Senior Lecturer',
    'Visiting Faculty',
    'Guest Lecturer',
    'Department Head'
  ];

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
    }
  };  
const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return role ? null : 'Please select your role';
      case 2:
        if (!name.trim()) return 'Full name is required';
        if (!email.trim()) return 'Email is required';
        if (!phone.trim()) return 'Phone number is required';
        return null;
      case 3:
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (password !== confirmPassword) return 'Passwords do not match';
        return null;
      case 4:
        if (role === 'student') {
          if (!rollNumber.trim()) return 'Roll number is required';
          if (!department) return 'Department is required';
          if (!year) return 'Year is required';
          if (!semester) return 'Semester is required';
        } else if (role === 'teacher') {
          if (!employeeId.trim()) return 'Employee ID is required';
          if (!department) return 'Department is required';
          if (!designation) return 'Designation is required';
        }
        return null;
      case 5:
        return null; // Profile picture is optional
      default:
        return null;
    }
  };

  const validateForm = () => {
    for (let i = 1; i <= totalSteps; i++) {
      const stepError = validateStep(i);
      if (stepError) return stepError;
    }
    return null;
  };

  const handleNext = () => {
    const stepError = validateStep(currentStep);
    if (stepError) {
      setError(stepError);
      return;
    }
    
    setError('');
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Allow clicking on completed steps or the next step
    if (completedSteps.includes(stepNumber) || stepNumber === currentStep) {
      setCurrentStep(stepNumber);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('')    }
  }; again.');
tryease n failed. Pltio 'Registrasage ||r(error.mesrro  setEany) {
    or: err } catch (a);
   ter(userDat regis   await  
   };
         })
   
      ministrator'Ader | 'Supgnation |ion: desi designat
         tion',dministratem A|| 'Syspartment  deepartment:      d
    ',001d || 'SUPERloyeeIyeeId: emp     emplo    n' && {
 _admi === 'superrole      ...( }),
  
       tiondesigna         artment,
   dep
         employeeId,         ' && {
== 'teacher ...(role =       }),
     ester
       semar,
      ye       tment,
   ar      dep   Number,
 ll  ro     {
    && udent'== 'stole =      ...(role,
      rd,
    or    passw
    one,     ph
   l,   emai        name,
 
    erData = {const us  {
    try 
    
    urn;
    }   retror);
   onErlidatiError(va
      setor) {nErr (validatio  if();
  dateFormrror = valitionEnst valida
    co;
