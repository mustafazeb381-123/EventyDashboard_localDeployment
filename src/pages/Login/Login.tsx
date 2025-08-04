import React, { useState, useEffect, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import Assets from '../../utils/Assets';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ToastContainer, toast } from 'react-toastify';




function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // isVisible is unused, so it's best to remove it
  // const [isVisible, setIsVisible] = React.useState(false); 
  const [loading, setLoading] = useState(false);
  
  // Correct the color code for white (#ffffff)
  

  // 🔐 Redirect to /home if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]); // Add 'navigate' to the dependency array

  const handleSignIn = async () => {
    setLoading(true);
    try {
      // Do validation or API call here
      await localStorage.setItem("token", "123");
      
      // Use toast.success() for better UX
      toast.success("Logged in successfully!"); 
      
      // Reduce the timeout to a more reasonable time (e.g., 2 seconds)
      setTimeout(() => {
        navigate('/home');
      }, 4000); 
    } catch (error) {
      console.error("error", error); // Use console.error for errors
      toast.error("Login failed. Please try again."); // Provide user feedback on error
    } finally {
     
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <div className="w-full flex flex-col md:flex-row justify-evenly min-h-[calc(100vh-5rem)] bg-gradient-to-br from-[#E4E6EE] to-white rounded-2xl">
        {/* Left Section (Form) */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-4 py-8 ">
          <img src={Assets.images.eventyLoginLogo} width="186" height="80" alt="Logo" />
          <div className="mt-10 w-full max-w-sm">
            <Input
              className="font-light font-poppins text-gray-400 mb-4"
              style={{ fontSize: 12, borderRadius: 20 }}
              type="email"
              placeholder={t('Enter your email')}
            />
            <Input
              className="font-light font-poppins text-gray-400 mb-2"
              style={{ fontSize: 12, borderRadius: 20 }}
              type="password"
              placeholder={t('Enter your password')}
            />

            <div className="flex gap-1 mb-4">
              <p className="text-sm text-gray-900 font-poppins font-light">{t('Forget password?')}</p>
              <p className="text-sm font-poppins font-semibold text-[#3563E9] underline cursor-pointer">
                {t('Reset the password')}
              </p>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm font-poppins text-gray-700">
                {t('Remember me')}
              </Label>
            </div>

            <Button
              onClick={handleSignIn}
              style={{ backgroundColor: '#1A1F58', borderRadius: 20 }}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <p style={{color:"white"}}>
                  ...Loading
                </p>
              ) : (
                <span className='text-white'>{t('Signin')}</span>
              )}
            </Button>


            <div className="mt-4 flex justify-center gap-1">
              <p className="text-sm text-gray-900 font-poppins font-light">
                {t("Don't have an account?")}
              </p>
              <p
                className="text-sm font-poppins font-light text-[#3563E9] underline cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                {t("Signup")}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section (Image) */}
        <div className="hidden md:flex justify-center items-center w-1/2">
          <img
            src={Assets.images.loginRIghtImage}
            className="w-4/7 max-w-md h-auto object-cover rounded-lg"
            alt="login visual"
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;