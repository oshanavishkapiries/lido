import { Badge } from "@/components/ui/badge";
import FormComponent from "./form";
//import Background from "./background";

const Hero = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      {/* <Background /> */}

      <div className="relative z-10 text-center max-w-2xl">
        <Badge className="rounded-full py-1 px-3 border-none">
          Just released v1.0.0
        </Badge>
        <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold !leading-[1.2] tracking-tight">
          Make Your Meeting More Interactive
        </h1>
        <p className="mt-6 text-[17px] md:text-lg">
          Engage your participants with word clouds
          <br />
          whether you meet in the office, online or in-between.
        </p>
        <div className="mt-6 w-full max-w-sm relative mx-auto">
          <FormComponent />
        </div>
      </div>
    </div>
  );
};

export default Hero;
