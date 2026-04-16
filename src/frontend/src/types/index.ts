export interface BlogPost {
  id: bigint;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedDate: bigint;
  imageUrl: string;
  category: string;
}

export interface Testimonial {
  clientName: string;
  quote: string;
  country: string;
  photoUrl: string;
}

export interface FileAttachment {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

export interface ContactSubmission {
  id: bigint;
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceOfInterest?: string;
  countryOfInterest: string;
  message: string;
  timestamp: bigint;
  preferredContactMethod?: string;
  privacyConsent?: boolean;
  attachedFiles?: FileAttachment[];
}
