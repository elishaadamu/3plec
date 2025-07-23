import { Subscript } from "lucide-react";
import ResetPin from "../user/layout/ResetPin";

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  endpoints: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgotPassword",
    verifyCode: "/auth/verifyCode",
    setPassword: "/auth/setPassword",
    virtualAccount: "/virtualAccount",
    NINVerify: "/verify/nin",
    BVNVerify: "/verify/bvn",
    VerificationHistory: "/transactions/dataHistory/",
    setPin: "/virtualAccount/setPin",
    ResetPin: "/virtualAccount/resetPin",
    dataSubscription: "/vtu/data",
    airtimeSubscription: "/vtu/airtime",
    subscriptionHistory: "/transactions/history/",
    ipeSubmit: "/verify/submit/ipe",
    checkStatusipe: "/verify/freeStatus/ipe",
    freeStatusipe: "/verify/freeStatus/ipe",
    cacRegistration: "/cac/register",
    bankAgentRegistration: "/bvn/register",
    bvnLicenceRegistration: "/bvn/licence",
    Modification: "/modify/register",
    Personalisation: "/verify/personalisation",
    DemographicSearch: "/demographic/search",
    Enrollment: "/enrollment/register",
    apitoken: "/developer/tokens",
    currentapipricing: "/transactions/prices",
  },
};
