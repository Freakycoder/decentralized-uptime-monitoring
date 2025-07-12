import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { fadeIn } from '../../lib/framer-variants';
import axios from 'axios';
import { useState } from 'react';
import { url } from 'inspector';

interface websocketInput {
  status_code: number;
  message: string
}

const AddWebsiteBanner: React.FC = () => {

  const [message, SetMessage] = useState<websocketInput>();
  const [url, setUrl] = useState<string>()

  const handler = async () => {
    const response = await axios.post("http://localhost:3001/website-monitor/add", {
      url_to_monitor: url
    }, {withCredentials : true});

    SetMessage({
      status_code: response.data.status_code,
      message: response.data.message
    })

  }
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden mb-8 rounded-lg border border-border bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-6 shadow-sm"
    >
      <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10">
        <h2 className="mb-1 text-2xl font-bold">
          Hi Ahmed, Welcome to Digital Data Contribution Network
        </h2>

        <p className="mb-6 max-w-3xl text-muted-foreground">
          Turn your devices into passive income generators by contributing valuable digital data.
          Select a contribution method below to get started or view your current earnings.
        </p>
        <input className='w-full bg-black text-white mb-4 rounded-md p-3' onChange={(e) => setUrl(e.target.value)} placeholder='Enter the url to be monitered' type='url' />
        {message && message?.status_code === 200 ? (
          <p className="text-green-500 font-medium mb-2">✅ {message?.message}</p>
        ) : (
          <p className="text-red-500 font-medium mb-2"> {message?.message}</p>
        )}
        <div className="flex flex-wrap gap-4">
          <Button onClick={handler}>
            Add this website
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AddWebsiteBanner;

