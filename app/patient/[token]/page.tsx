import { Clock, User, Stethoscope, MapPin, Volume2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import HindiVoiceButton from "@/components/HindiVoiceButton";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  
  // Hardcoded mock values as per PRD demo script
  const currentToken = 61;
  const myToken = parseInt(token) || 75;
  const patientsAhead = myToken - currentToken;
  const estimatedWaitMins = 38;
  const estimatedTime = "11:45 AM";

  return (
    <div className="min-h-full bg-slate-50 flex flex-col p-4 sm:p-6 lg:p-8 overflow-x-hidden font-sans">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Arogya<span className="text-emerald-600">Flow</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium flex items-center mt-1">
            <Stethoscope className="w-4 h-4 mr-1 text-slate-400" />
            General Medicine
          </p>
        </div>
        <div className="flex items-center text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
          <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-500" />
          Room 104
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col space-y-6 max-w-md w-full mx-auto">
        
        <StatusBadge 
          myToken={myToken} 
          currentToken={currentToken} 
          estimatedWaitMins={estimatedWaitMins} 
        />

        {/* Giant Card for Tokens */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-emerald-50 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col space-y-8">
            <div className="flex justify-between items-end border-b border-slate-100 pb-6">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Token</p>
                <div className="text-5xl font-black text-slate-900">#{myToken}</div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Now Serving</p>
                <div className="text-3xl font-bold text-slate-400">#{currentToken}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center space-x-2 text-slate-500 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Patients Ahead</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{patientsAhead}</div>
              </div>
              
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Est. Wait</span>
                </div>
                <div className="text-2xl font-bold text-emerald-700">~{estimatedWaitMins}m</div>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Time Note */}
        <div className="text-center mt-2">
          <p className="text-sm text-slate-500 font-medium">
            Expected consultation at <span className="font-bold text-slate-800">{estimatedTime}</span>
          </p>
        </div>

      </main>

      <HindiVoiceButton 
        myToken={myToken} 
        estimatedWaitMins={estimatedWaitMins} 
        patientsAhead={patientsAhead} 
      />

    </div>
  );
}
