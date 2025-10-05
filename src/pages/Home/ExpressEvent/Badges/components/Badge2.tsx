import React from "react";
import { X } from "lucide-react";

interface Badge {
    id: number;
    name: string;
    frontImg: string;
    backImg: string;
    userImg?: string;
    qrImg: string;
    cardHeader: string;
    cardFooter: string;
}

interface Badge2Props {
    badge: Badge;
    event: any;
    onClose: () => void;
    CardHeader: React.FC<{ color?: string }>;
    CardFooter: React.FC<{ color?: string }>;
}

const Badge2: React.FC<Badge2Props> = ({ badge, event, onClose, CardHeader, CardFooter, }) => {

    return (

        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">

            <div className="bg-white rounded-3xl p-6 h-[95vh] overflow-y-auto w-full md:w-3/4">

                {/* Close Btn */}
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-poppins font-semibold">{badge.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 bg-gray-200 rounded p-1">
                        <X />
                    </button>
                </div>

                <div className="flex flex-col justify-center items-center sm:flex-row gap-6">

                    {/* Card Front */}
                    <div className="flex flex-col h-[100vh] w-full rounded-xl border-1" >

                        {/* Front */}
                        <div className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
                            style={{ height: "33vh" }} >
                            <div className="absolute inset-0"> <CardHeader color={event?.attributes?.primary_color} /></div>
                        </div>

                        {/* Center */}
                        <div className="flex flex-1 flex-col justify-evenly items-center">
                            <div className="text-center ">
                                <h2 className="text-lg font-bold text-gray-900">User Name</h2>
                                <p className="text-gray-600 text-sm">User Title</p>
                            </div>
                            <div className="relative z-10 flex items-center gap-2">
                                {event?.attributes?.logo_url && (
                                    <img src={event.attributes.logo_url} className="w-8 h-8 mb-6" />
                                )}
                                <h6 className="font-semibold mb-6 text-black">Company Name</h6>
                            </div>
                        </div>

                        {/* Bottom */}
                        <div className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden"
                            style={{ height: "15vh" }}>
                            <div className="absolute inset-0">
                                <CardFooter color={event?.attributes?.primary_color} />
                            </div>
                        </div>

                    </div>

                    {/* Card Back */}
                    <div className="flex flex-col h-[100vh] w-full rounded-xl border-1" >

                        {/* Top */}
                        <div className="relative flex justify-center items-center gap-2 w-full rounded-t-xl overflow-hidden"
                            style={{ height: "33vh" }}>
                            <div className="relative z-10 flex items-center gap-2">
                                {event?.attributes?.logo_url && (
                                    <img src={event.attributes.logo_url} className="w-8 h-8 mb-6" />
                                )}
                                <h6 className="font-semibold mb-6 text-black">Company Name</h6>
                            </div>
                        </div>

                        {/* Center */}
                        <div className="flex flex-1 flex-col justify-center items-center">
                            <h2 className="text-lg font-bold text-gray-900">{event?.attributes?.name}</h2>
                            <img src={badge.qrImg} className="h-50" />
                        </div>

                        {/* Bottom */}
                        <div className="relative flex justify-center items-center gap-2 w-full rounded-b-xl overflow-hidden" style={{ height: "15vh" }}>
                            <div className="absolute inset-0">
                                <CardFooter color={event?.attributes?.primary_color} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Badge2;
