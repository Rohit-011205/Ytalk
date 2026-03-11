import { useEffect } from "react";
import { useVideoCallStore } from "../Store/useVideoCall.js";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff, X, Users, Video } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "../Store/useAuthStore.js";

// Status icon and color mapping
const STATUS_CONFIG = {
    outgoing: { icon: PhoneOutgoing, color: "text-blue-400", label: "Outgoing" },
    incoming: { icon: PhoneIncoming, color: "text-green-400", label: "Incoming" },
    missed: { icon: PhoneMissed, color: "text-red-400", label: "Missed" },
    declined: { icon: PhoneOff, color: "text-orange-400", label: "Declined" },
    cancelled: { icon: PhoneOff, color: "text-gray-400", label: "Cancelled" },
};

export default function CallHistoryModal({ onClose,isOpen }) {
      if (!isOpen) return null;

    const { callHistory, isHistoryLoading, getCallHistory, initiateCall } = useVideoCallStore();
    const { authUser } = useAuthStore();

    useEffect(() => {
        getCallHistory();
    }, []);

    const getCallConfig = (call) => {
        if (call.status === "missed") return STATUS_CONFIG.missed;
        if (call.status === "declined") return STATUS_CONFIG.declined;
        if (call.status === "cancelled") return STATUS_CONFIG.cancelled;
        return STATUS_CONFIG[call.direction] || STATUS_CONFIG.incoming;
    };

    const getCallDisplay = (call) => {
        if (call.callType === "group") {
            return {
                name: call.groupId?.name || "Group Call",
                avatar: call.groupId?.groupPic || null,
                isGroup: true,
            };
        }
        // For direct: show the OTHER person (not yourself)
        const isMe = call.initiatedBy._id === authUser._id;
        const other = isMe ? call.receiverId : call.initiatedBy;
        return {
            name: other?.Fullname || "Unknown",
            avatar: other?.profilePic || null,
            isGroup: false,
            otherId: other?._id,
            otherInfo: other,
        };
    };

    const handleCallBack = (call) => {
        const display = getCallDisplay(call);
        if (call.callType === "direct") {
            initiateCall("direct", display.otherId, null, display.otherInfo);
        } else {
            initiateCall("group", null, call.groupId?._id);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-white/10 
                      max-h-[80vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-400" />
                        Call History
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {isHistoryLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : callHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                            <Phone className="w-10 h-10 mb-2 opacity-30" />
                            <p>No call history</p>
                        </div>
                    ) : (
                        callHistory.map((call) => {
                            const config = getCallConfig(call);
                            const display = getCallDisplay(call);
                            const Icon = config.icon;

                            return (
                                <div
                                    key={call._id}
                                    className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 
                             transition-colors border-b border-white/5 group"
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={display.avatar || "/avatar.png"}
                                            alt={display.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        {display.isGroup && (
                                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                                                <Users className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{display.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                                            <span className={`text-xs ${config.color}`}>{config.label}</span>
                                            <span className="text-gray-600 text-xs">·</span>
                                            <span className="text-gray-500 text-xs">
                                                {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Call back button — shows on hover */}
                                    <button
                                        onClick={() => handleCallBack(call)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity
                               p-2 bg-green-500/20 hover:bg-green-500/40 rounded-full"
                                        title="Call back"
                                    >
                                        <Video className="w-4 h-4 text-green-400" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
}