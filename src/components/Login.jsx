import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg-image.png";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import { BASE_URL } from "../utils/constants";

const LoginForm = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const bodyData = isLogin
        ? { emailId: formData.emailId, password: formData.password }
        : formData;
      // const res = await fetch(`http://localhost:5000${endpoint}`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(bodyData),
      // });

      const res = await axios.post(BASE_URL + "/login", bodyData, {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
      navigate("/");
      // if (!res.ok) {
      //   const data = await res.json();
      //   throw new Error(data.message || "Failed");
      // }

      // if (isLogin) {
      //   const data = await res.json();
      // } else {
      //   setIsLogin(true);
      // }
    } catch (err) {
      setError(err?.message?.data || "Something went wrong!");
    }
  };

  return (
    <div className="flex justify-center pt-20 items-center h-full bg-cover bg-center relative">
      {/* <div className="absolute inset-0 bg-black/40"></div> */}

      <div className="relative z-10 w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-lg bg-white/10">
        <div className="relative w-[900px] h-[600px] rounded-3xl overflow-hidden shadow-lg bg-white/10">
          {/* Blur Side */}
          <div
            className={`absolute top-0 h-full w-1/2 flex items-center justify-center backdrop-blur-md bg-black/40 transition-all duration-700 ${
              isLogin ? "left-0 translate-x-0" : "left-0 translate-x-full"
            }`}
          >
            <h2 className="text-5xl font-bold bg-gradient-to-tr from-[#fe5a33] via-[#fe0142] via-30% to-[#fe6d27] inline-block text-transparent bg-clip-text">
              DevTinder
            </h2>
          </div>

          {/* Form Side */}
          <div
            className={`absolute top-0 h-full w-1/2 bg-white flex flex-col justify-center px-16 transition-all duration-700 ${
              isLogin ? "right-0 translate-x-0" : "right-0 -translate-x-full"
            }`}
          >
            <div className="w-full max-w-sm mx-auto space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-800">
                  {!isLogin ? "Sign In" : "Sign Up"}
                </h2>
                <p className="text-gray-500 mt-2">
                  {!isLogin
                    ? "Welcome back to devTinder"
                    : "Create your devTinder account"}
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {isLogin ? (
                  <>
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        onChange={handleChange}
                        required
                        className="w-1/2 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        onChange={handleChange}
                        required
                        className="w-1/2 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <input
                      type="email"
                      name="emailId"
                      placeholder="Email address"
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="email"
                      name="emailId"
                      placeholder="Email address"
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-l font-semibold from-[#fe5a33] via-[#fe0142] via-30% to-[#fe6d27] text-white py-3 rounded-md"
                >
                  {!isLogin ? "Sign In" : "Sign Up"}
                </button>

                {error && <p className="text-red-500 text-center">{error}</p>}
              </form>

              <p className="text-center text-sm text-gray-600">
                {!isLogin ? (
                  <>
                    Don’t have an account?{" "}
                    <span
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-rose-500 cursor-pointer hover:underline"
                    >
                      Sign Up
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-rose-500 cursor-pointer hover:underline"
                    >
                      Sign In
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
