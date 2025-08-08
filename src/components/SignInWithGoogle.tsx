import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { auth, db } from "../firebase";
import { toast } from "react-toastify";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { Chrome } from "lucide-react";

function SignInWithGoogle() {
  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    
    // Add additional scopes if needed
    provider.addScope('email');
    provider.addScope('profile');
    
    try {
      await signInWithRedirect(auth, provider);
      // Note: The redirect will happen immediately, so no further code will execute here
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      // Handle specific error cases
      if (error.code === 'auth/cancelled-popup-request') {
        // User cancelled - don't show error
        return;
      } else {
        toast.error(error.message || "Google sign-in failed. Please try again.", {
          position: "bottom-center",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        onClick={googleLogin}
        type="button"
        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-300 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
      >
        <Chrome className="w-5 h-5 text-red-500" />
        <span>Continue with Google</span>
      </button>
    </div>
  );
}

export default SignInWithGoogle;