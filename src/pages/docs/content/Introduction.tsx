import _React from 'react';
import { PlusSquare, Code2 } from 'lucide-react';

const Introduction = () => {
  return (
    <>
      <h1 className="text-5xl mb-6">Introduction</h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-8">
        Welcome to the Directum Documentation page! The guides provided will help you understand how Directum works and how to better manage your bot on our platform! If you have any questions regarding content here or about something that isin't quite discussed, feel free to reach out on our support server!
      </p>

      <h2 className="text-2xl mt-12 mb-4">Why Directum?</h2>
      <p>
        Directum isn't just another listing site. We focus on <strong>visibility</strong> and <strong>reliability</strong>. 
        Our platform provides developers with deep analytics into how users interact with their listings. 
        Unlike other platforms, we do not enforce strict content guidelines, allowing for more creative freedom in how you present your bot!
      </p>
      
      <div className="bg-secondary/50 border-l-4 border-primary p-6 my-8 rounded-r-xl">
        <p className="m-0 font-medium text-foreground">
          This documentation is a work in progress by dedicated staff and volunteers! A full list of contributors can be found <a href="https://directum.org/docs/contributors" className="text-primary underline">here</a>
        </p>
      </div>
      {/* Spacing at the bottom for better UX */}
      <div className="mb-32" />
    </>
  );
};

export default Introduction;