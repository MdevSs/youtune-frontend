import { cn } from "../../lib/utils";
import { ReactNode } from "react";
import { Text } from "../ui/text";
export default function GradientTitle({ children }: { children: ReactNode }) {
    return (
        <Text className="lg:leading-[1.1] text-balance bg-gradient-to-br from-destructive from-25% to-black bg-clip-text py-4 text-3xl font-bold leading-none tracking-tighter text-transparent dark:from-destructive dark:to-white ">
            {children}
        </Text>
    )
}