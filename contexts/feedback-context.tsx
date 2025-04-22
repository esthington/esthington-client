"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { successToast, errorToast } from "@/lib/toast";

// Types for feedback and reviews
export type ReviewType = "property" | "investment" | "agent" | "platform";

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type Review = {
  id: string;
  type: ReviewType;
  targetId: string;
  targetName: string;
  targetImage?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: ReviewRating;
  title: string;
  content: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  isPublished: boolean;
  adminResponse?: string;
  adminResponseAt?: string;
  likes: number;
  dislikes: number;
  userReaction?: "like" | "dislike";
};

export type FeedbackType = "bug" | "feature" | "complaint" | "praise" | "other";

export type FeedbackStatus = "open" | "in_progress" | "resolved" | "closed";

export type Feedback = {
  id: string;
  type: FeedbackType;
  title: string;
  content: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  status: FeedbackStatus;
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  adminResponse?: string;
  adminResponseAt?: string;
  category?: string;
  tags?: string[];
  screenshots?: string[];
};

// Context type
type FeedbackContextType = {
  // State
  reviews: Review[];
  userReviews: Review[];
  feedback: Feedback[];
  isLoading: boolean;
  isSubmitting: boolean;

  // Review actions
  getReviews: (type: ReviewType, targetId?: string) => Promise<Review[]>;
  getUserReviews: () => Promise<Review[]>;
  getReview: (id: string) => Promise<Review | null>;
  createReview: (
    review: Omit<
      Review,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "isVerified"
      | "isPublished"
      | "likes"
      | "dislikes"
      | "userReaction"
    >
  ) => Promise<Review | null>;
  updateReview: (id: string, data: Partial<Review>) => Promise<boolean>;
  deleteReview: (id: string) => Promise<boolean>;
  reactToReview: (
    id: string,
    reaction: "like" | "dislike" | null
  ) => Promise<boolean>;

  // Feedback actions
  getFeedback: (status?: FeedbackStatus) => Promise<Feedback[]>;
  getUserFeedback: () => Promise<Feedback[]>;
  getFeedbackItem: (id: string) => Promise<Feedback | null>;
  createFeedback: (
    feedback: Omit<
      Feedback,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "status"
      | "priority"
      | "resolvedAt"
      | "assignedTo"
      | "adminResponse"
      | "adminResponseAt"
    >
  ) => Promise<Feedback | null>;
  updateFeedback: (id: string, data: Partial<Feedback>) => Promise<boolean>;
  deleteFeedback: (id: string) => Promise<boolean>;

  // Admin actions
  verifyReview: (id: string) => Promise<boolean>;
  publishReview: (id: string, isPublished: boolean) => Promise<boolean>;
  respondToReview: (id: string, response: string) => Promise<boolean>;
  assignFeedback: (id: string, adminId: string) => Promise<boolean>;
  updateFeedbackStatus: (
    id: string,
    status: FeedbackStatus
  ) => Promise<boolean>;
  updateFeedbackPriority: (
    id: string,
    priority: "low" | "medium" | "high"
  ) => Promise<boolean>;
  respondToFeedback: (id: string, response: string) => Promise<boolean>;
};

// Mock data
const mockReviews: Review[] = [
  {
    id: "rev1",
    type: "property",
    targetId: "prop1",
    targetName: "Luxury Land in Lekki Phase 1",
    targetImage:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGFuZHxlbnwwfHwwfHx8MA%3D%3D",
    userId: "user123",
    userName: "John Doe",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Excellent investment opportunity",
    content:
      "I purchased this land as an investment and it has already appreciated significantly. The location is prime and the documentation process was smooth.",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isVerified: true,
    isPublished: true,
    likes: 12,
    dislikes: 1,
    userReaction: "like",
  },
  {
    id: "rev2",
    type: "agent",
    targetId: "agent1",
    targetName: "Sarah Wilson",
    targetImage: "/placeholder.svg?height=40&width=40",
    userId: "user456",
    userName: "Jane Smith",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    title: "Professional and responsive",
    content:
      "Sarah was very professional and responsive throughout the property acquisition process. She provided all the information I needed and was always available to answer my questions.",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isVerified: true,
    isPublished: true,
    likes: 5,
    dislikes: 0,
  },
  {
    id: "rev3",
    type: "investment",
    targetId: "inv1",
    targetName: "Luxury Apartment Complex",
    targetImage:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJlYWwlMjBlc3RhdGV8ZW58MHx8MHx8fDA%3D",
    userId: "user789",
    userName: "Robert Johnson",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 3,
    title: "Good returns but slow process",
    content:
      "The investment has provided good returns so far, but the initial process was slower than expected. Documentation took longer than promised.",
    images: ["/placeholder.svg?height=300&width=400"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isVerified: false,
    isPublished: false,
    likes: 0,
    dislikes: 0,
  },
  {
    id: "rev4",
    type: "platform",
    targetId: "platform",
    targetName: "Esthington Platform",
    userId: "user123",
    userName: "John Doe",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Excellent platform for real estate investments",
    content:
      "The platform is very user-friendly and provides all the necessary information to make informed investment decisions. The customer support is also excellent.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isVerified: true,
    isPublished: true,
    adminResponse:
      "Thank you for your positive feedback! We're constantly working to improve the platform.",
    adminResponseAt: new Date(
      Date.now() - 4 * 24 * 60 * 60 * 1000
    ).toISOString(), // 4 days ago
    likes: 8,
    dislikes: 0,
  },
];

const mockFeedback: Feedback[] = [
  {
    id: "feed1",
    type: "bug",
    title: "Error when uploading documents",
    content:
      "I'm getting an error when trying to upload my identity documents for verification. The upload starts but then fails at 80% with an error message saying 'Connection lost'.",
    userId: "user123",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    status: "in_progress",
    priority: "high",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    assignedTo: "tech1",
    category: "Technical",
    tags: ["upload", "verification", "documents"],
    screenshots: ["/placeholder.svg?height=300&width=400"],
  },
  {
    id: "feed2",
    type: "feature",
    title: "Add option to filter properties by proximity to schools",
    content:
      "It would be great if we could filter properties based on their proximity to schools and other educational institutions.",
    userId: "user456",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    status: "open",
    priority: "medium",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Feature Request",
    tags: ["filter", "property", "schools"],
  },
  {
    id: "feed3",
    type: "praise",
    title: "Excellent customer service",
    content:
      "I just wanted to express my appreciation for the excellent customer service I received from your support team. They were very helpful in resolving my issue with a payment.",
    userId: "user789",
    userName: "Robert Johnson",
    userEmail: "robert.johnson@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    status: "closed",
    priority: "low",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
    resolvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    adminResponse: "Thank you for your kind words! We're glad we could help.",
    adminResponseAt: new Date(
      Date.now() - 9 * 24 * 60 * 60 * 1000
    ).toISOString(),
    category: "Customer Service",
    tags: ["praise", "support", "payment"],
  },
];

// Create context
const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

// Provider component
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        // In a real app, these would be API calls
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setReviews(mockReviews);
        setUserReviews(
          mockReviews.filter((review) => review.userId === "user123")
        ); // Mock current user
        setFeedback(mockFeedback);
      } catch (error) {
        console.error("Failed to initialize feedback data:", error);
        errorToast("Failed to load feedback data");
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // Get reviews
  const getReviews = async (
    type: ReviewType,
    targetId?: string
  ): Promise<Review[]> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Filter reviews
      let filteredReviews = reviews.filter(
        (review) => review.type === type && review.isPublished
      );

      if (targetId) {
        filteredReviews = filteredReviews.filter(
          (review) => review.targetId === targetId
        );
      }

      return filteredReviews;
    } catch (error) {
      console.error("Failed to get reviews:", error);
      errorToast("Failed to load reviews");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get user reviews
  const getUserReviews = async (): Promise<Review[]> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      return userReviews;
    } catch (error) {
      console.error("Failed to get user reviews:", error);
      errorToast("Failed to load your reviews");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get review by ID
  const getReview = async (id: string): Promise<Review | null> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return reviews.find((review) => review.id === id) || null;
    } catch (error) {
      console.error("Failed to get review:", error);
      errorToast("Failed to load review");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create review
  const createReview = async (
    review: Omit<
      Review,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "isVerified"
      | "isPublished"
      | "likes"
      | "dislikes"
      | "userReaction"
    >
  ): Promise<Review | null> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create new review
      const now = new Date().toISOString();
      const newReview: Review = {
        ...review,
        id: `rev${reviews.length + 1}`,
        createdAt: now,
        updatedAt: now,
        isVerified: false,
        isPublished: false,
        likes: 0,
        dislikes: 0,
      };

      // Update state
      setReviews((prev) => [...prev, newReview]);
      setUserReviews((prev) => [...prev, newReview]);

      successToast("Review submitted successfully");
      return newReview;
    } catch (error) {
      console.error("Failed to create review:", error);
      errorToast("Failed to submit review");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update review
  const updateReview = async (
    id: string,
    data: Partial<Review>
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update review
      const now = new Date().toISOString();
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id ? { ...review, ...data, updatedAt: now } : review
        )
      );

      // Update user reviews
      setUserReviews((prev) =>
        prev.map((review) =>
          review.id === id ? { ...review, ...data, updatedAt: now } : review
        )
      );

      successToast("Review updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update review:", error);
      errorToast("Failed to update review");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete review
  const deleteReview = async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Delete review
      setReviews((prev) => prev.filter((review) => review.id !== id));
      setUserReviews((prev) => prev.filter((review) => review.id !== id));

      successToast("Review deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete review:", error);
      errorToast("Failed to delete review");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // React to review
  const reactToReview = async (
    id: string,
    reaction: "like" | "dislike" | null
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update review
      setReviews((prev) =>
        prev.map((review) => {
          if (review.id === id) {
            // Calculate new likes/dislikes based on previous reaction and new reaction
            let likes = review.likes;
            let dislikes = review.dislikes;

            // Remove previous reaction if any
            if (review.userReaction === "like") {
              likes--;
            } else if (review.userReaction === "dislike") {
              dislikes--;
            }

            // Add new reaction if any
            if (reaction === "like") {
              likes++;
            } else if (reaction === "dislike") {
              dislikes++;
            }

            return {
              ...review,
              likes,
              dislikes,
              userReaction: reaction ?? undefined, // Ensure userReaction is undefined instead of null
            };
          }
          return review;
        })
      );

      return true;
    } catch (error) {
      console.error("Failed to react to review:", error);
      errorToast("Failed to record your reaction");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get feedback
  const getFeedback = async (status?: FeedbackStatus): Promise<Feedback[]> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Filter by status if provided
      if (status) {
        return feedback.filter((item) => item.status === status);
      }

      return feedback;
    } catch (error) {
      console.error("Failed to get feedback:", error);
      errorToast("Failed to load feedback");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get user feedback
  const getUserFeedback = async (): Promise<Feedback[]> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Filter feedback for current user
      return feedback.filter((item) => item.userId === "user123"); // Mock current user
    } catch (error) {
      console.error("Failed to get user feedback:", error);
      errorToast("Failed to load your feedback");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get feedback item by ID
  const getFeedbackItem = async (id: string): Promise<Feedback | null> => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return feedback.find((item) => item.id === id) || null;
    } catch (error) {
      console.error("Failed to get feedback item:", error);
      errorToast("Failed to load feedback item");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create feedback
  const createFeedback = async (
    feedbackData: Omit<
      Feedback,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "status"
      | "priority"
      | "resolvedAt"
      | "assignedTo"
      | "adminResponse"
      | "adminResponseAt"
    >
  ): Promise<Feedback | null> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create new feedback
      const now = new Date().toISOString();
      const newFeedback: Feedback = {
        ...feedbackData,
        id: `feed${feedback.length + 1}`,
        createdAt: now,
        updatedAt: now,
        status: "open",
        priority: "medium",
      };

      // Update state
      setFeedback((prev) => [...prev, newFeedback]);

      successToast("Feedback submitted successfully");
      return newFeedback;
    } catch (error) {
      console.error("Failed to create feedback:", error);
      errorToast("Failed to submit feedback");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update feedback
  const updateFeedback = async (
    id: string,
    data: Partial<Feedback>
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update feedback
      const now = new Date().toISOString();
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...data, updatedAt: now } : item
        )
      );

      successToast("Feedback updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update feedback:", error);
      errorToast("Failed to update feedback");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete feedback
  const deleteFeedback = async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Delete feedback
      setFeedback((prev) => prev.filter((item) => item.id !== id));

      successToast("Feedback deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete feedback:", error);
      errorToast("Failed to delete feedback");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify review (admin only)
  const verifyReview = async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update review
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id ? { ...review, isVerified: true } : review
        )
      );

      successToast("Review verified successfully");
      return true;
    } catch (error) {
      console.error("Failed to verify review:", error);
      errorToast("Failed to verify review");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publish review (admin only)
  const publishReview = async (
    id: string,
    isPublished: boolean
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update review
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id ? { ...review, isPublished } : review
        )
      );

      successToast(
        `Review ${isPublished ? "published" : "unpublished"} successfully`
      );
      return true;
    } catch (error) {
      console.error(
        `Failed to ${isPublished ? "publish" : "unpublish"} review:`,
        error
      );
      errorToast(`Failed to ${isPublished ? "publish" : "unpublish"} review`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Respond to review (admin only)
  const respondToReview = async (
    id: string,
    response: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update review
      const now = new Date().toISOString();
      setReviews((prev) =>
        prev.map((review) =>
          review.id === id
            ? {
                ...review,
                adminResponse: response,
                adminResponseAt: now,
              }
            : review
        )
      );

      successToast("Response added successfully");
      return true;
    } catch (error) {
      console.error("Failed to respond to review:", error);
      errorToast("Failed to add response");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign feedback (admin only)
  const assignFeedback = async (
    id: string,
    adminId: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update feedback
      const now = new Date().toISOString();
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                assignedTo: adminId,
                updatedAt: now,
                status: item.status === "open" ? "in_progress" : item.status,
              }
            : item
        )
      );

      successToast("Feedback assigned successfully");
      return true;
    } catch (error) {
      console.error("Failed to assign feedback:", error);
      errorToast("Failed to assign feedback");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update feedback status (admin only)
  const updateFeedbackStatus = async (
    id: string,
    status: FeedbackStatus
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update feedback
      const now = new Date().toISOString();
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
                updatedAt: now,
                resolvedAt:
                  status === "resolved" || status === "closed"
                    ? now
                    : item.resolvedAt,
              }
            : item
        )
      );

      successToast(`Feedback status updated to ${status}`);
      return true;
    } catch (error) {
      console.error("Failed to update feedback status:", error);
      errorToast("Failed to update feedback status");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update feedback priority (admin only)
  const updateFeedbackPriority = async (
    id: string,
    priority: "low" | "medium" | "high"
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update feedback
      const now = new Date().toISOString();
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, priority, updatedAt: now } : item
        )
      );

      successToast(`Feedback priority updated to ${priority}`);
      return true;
    } catch (error) {
      console.error("Failed to update feedback priority:", error);
      errorToast("Failed to update feedback priority");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Respond to feedback (admin only)
  const respondToFeedback = async (
    id: string,
    response: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update feedback
      const now = new Date().toISOString();
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                adminResponse: response,
                adminResponseAt: now,
                updatedAt: now,
              }
            : item
        )
      );

      successToast("Response added successfully");
      return true;
    } catch (error) {
      console.error("Failed to respond to feedback:", error);
      errorToast("Failed to add response");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const value = {
    reviews,
    userReviews,
    feedback,
    isLoading,
    isSubmitting,
    getReviews,
    getUserReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
    reactToReview,
    getFeedback,
    getUserFeedback,
    getFeedbackItem,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    verifyReview,
    publishReview,
    respondToReview,
    assignFeedback,
    updateFeedbackStatus,
    updateFeedbackPriority,
    respondToFeedback,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}

// Custom hook to use the context
export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
}
