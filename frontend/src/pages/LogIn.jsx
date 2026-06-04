import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogIn = async (e) => {
    e.preventDefault();
    try {
      //Fetch API
      const response = await fetch(
        "http://localhost:5000/api/users/login-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      console.log(data);
      //Store token inside localstorage
      localStorage.setItem("userToken", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };
//   return(
//       // flex, center everything, full height, light gray background
//       <div className="flex justify-center items-center min-h-screen bg-gray-100 font-sans">

//           {/* White card, padding, rounded corners, shadow */}
//           <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm">

//               <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">Finora Bank</h2>
//               <p className="text-sm text-gray-500 text-center mb-8">Sign in to manage your finances</p>

//               {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center mb-5">{error}</div>}

//               <form onSubmit={handleLogIn}>
//                   <div className="flex flex-col mb-5">
//                       <label className="text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
//                       <input
//                           type="email"
//                           className="px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
//                           value={email}
//                           onChange={(e) => setEmail(e.target.value)}
//                           placeholder="thomas@example.com"
//                           required
//                       />
//                   </div>

//                   <div className="flex flex-col mb-5">
//                       <label className="text-sm font-medium text-gray-700 mb-1.5">Password</label>
//                       <input
//                           type="password"
//                           className="px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
//                           value={password}
//                           onChange={(e) => setPassword(e.target.value)}
//                           placeholder="••••••••"
//                           required
//                       />
//                   </div>

//                   <button
//                       type="submit"
//                       className="w-full mt-2 py-3.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
//                   >
//                       Log In
//                   </button>
//               </form>
//           </div>
//       </div>
//   );

  return (
    <div className="flex justify-center items-center bg-gray-100 font-sans min-h-screen">
      <div className="p-10 bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-1.5 text-blue-700 text-center">Welcome to United Bank</h2>
        <p className="text-gray-500 text-center mb-8">Sign in to manage your finances</p>
        {error && <div className="text-gray">{error}</div>}
        <form onSubmit={handleLogIn} className="">
          {/* Email div */}
          <div className=" flex flex-col mb-5">
            <label className="text-gray-700 mb-1.5 text-base">Email Address</label>
            <input
              type="email"
              className="border rounded-lg border-gray-300 p-2"
              value={email}
              placeholder="example@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/*Password div */}
          <div className="flex flex-col mb-5">
            <label className="text-gray-700 mb-1.5 text-base">Password</label>
            <input
              type="password"
              value={password}
              className="border rounded-lg border-gray-300 p-2"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {/* LogIn Button */}
          <button type="submit" className="text-white bg-blue-700 rounded-lg w-full p-2 mt-1.5 cursor-pointer">LOG IN</button>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
