import React from "react";
import Layout from "../../layout"; // or "../../../layout" depending on folder structure
import StreetMap from "@/components/streetmap";
import { TextareaWithButton } from "@/app/(front)/components/textbox";

export default function DashboardPage() {
    return (
        <Layout>
            <div className="flex flex-col w-full p-4 gap-4 max-w-6xl mx-auto"> {/* Added max-w-6xl and mx-auto */}
                <h2 className="text-xl mb-2">Admin Dashboard</h2>

                {/* Map Positioned Above Text Box with lower z-index */}
                <div className="w-full flex justify-center relative z-10">
                    <div className="w-full"> {/* Removed max-w-3xl constraint */}
                        <StreetMap />
                    </div>
                </div>

                {/* Text box remains below */}
                <div className="w-full">
                    <TextareaWithButton />
                </div>
            </div>
        </Layout>
    );
}




