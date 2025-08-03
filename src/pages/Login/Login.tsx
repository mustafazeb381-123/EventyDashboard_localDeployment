import React from 'react';
import { useTranslation } from 'react-i18next';
import Assets from '../../utils/Assets';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = React.useState(false);

  const handleSignIn = async () => {
    // Do validation or API call here
    navigate('/home');
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
              placeholder="Enter your email"
            />
            <Input
              className="font-light font-poppins text-gray-400 mb-2"
              style={{ fontSize: 12, borderRadius: 20 }}
              type="password"
              placeholder="Enter your password"
            />

            <div className="flex gap-1 mb-4">
              <p className="text-sm text-gray-900 font-poppins font-light">Forget password?</p>
              <p className="text-sm font-poppins font-semibold text-[#3563E9] underline cursor-pointer">
                Reset the password
              </p>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm font-poppins text-gray-700">
                Remember me
              </Label>
            </div>

            <Button
              onClick={handleSignIn}
              style={{ backgroundColor: '#1A1F58', borderRadius: 20 }}
              className="w-full"
            >
              <span className='text-white'>Signin</span>
            </Button>

            <div className="mt-4 flex justify-center gap-1">
              <p className="text-sm text-gray-900 font-poppins font-light">
                Don't have an account?
              </p>
              <p className="text-sm font-poppins font-light text-[#3563E9] underline cursor-pointer">
                Signup
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
    </div>
  );
}

export default Login;