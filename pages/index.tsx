import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
      <header className="text-center p-10">
        <h1 className="text-5xl font-bold mb-4">Welcome to Adgenxa</h1>
        <p className="text-lg">Transforming your digital experience with innovation.</p>
      </header>

      <section className="value-props flex flex-col items-center my-10">
        <h2 className="text-3xl font-semibold mb-6">Our Value Propositions</h2>
        <div className="flex space-x-10">
          <div className="p-4 bg-white text-black rounded-lg shadow-lg">
            <h3 className="font-bold">Speed</h3>
            <p>Experience lightning-fast performance.</p>
          </div>
          <div className="p-4 bg-white text-black rounded-lg shadow-lg">
            <h3 className="font-bold">Reliability</h3>
            <p>Count on us for consistent service.</p>
          </div>
          <div className="p-4 bg-white text-black rounded-lg shadow-lg">
            <h3 className="font-bold">Innovation</h3>
            <p>Stay ahead with cutting-edge solutions.</p>
          </div>
        </div>
      </section>

      <section className="ritual-feed my-10">
        <h2 className="text-3xl font-semibold mb-6">Ritual Feed</h2>
        <div className="flex flex-col space-y-4">
          <div className="p-4 bg-white text-black rounded-lg shadow-lg">Ritual 1: Engage with your community.</div>
          <div className="p-4 bg-white text-black rounded-lg shadow-lg">Ritual 2: Share and collaborate.</div>
          <div className="p-4 bg-white text-black rounded-lg shadow-lg">Ritual 3: Discover new opportunities.</div>
        </div>
      </section>

      <footer className="chat-bubble my-10">
        <div className="p-4 bg-yellow-400 rounded-full shadow-lg">
          <h3 className="font-bold">Bee Chat Bubble</h3>
          <p>Click here to start chatting!</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;