import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ChevronRight, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../context/AppContext';

const INSIGHT_ICONS = {
  positive: TrendingUp,
  negative: TrendingDown,
  warning: AlertTriangle,
  suggestion: Lightbulb,
  neutral: Sparkles,
  info: Sparkles,
};

const INSIGHT_COLORS = {
  positive: 'text-emerald-growth border-emerald-growth/30 bg-emerald-growth/10',
  negative: 'text-red-400 border-red-400/30 bg-red-400/10',
  warning: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  suggestion: 'text-plaid-blue border-plaid-blue/30 bg-plaid-blue/10',
  neutral: 'text-gray-400 border-gray-500/30 bg-gray-500/10',
  info: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
};

const TYPING_MESSAGES = [
  'Analyzing your spending patterns...',
  'Identifying savings opportunities...',
  'Comparing with historical trends...',
  'Generating personalized insights...',
];

export function GeminiInsightPanel() {
  const { insights, isConnected } = useApp();
  const [isTyping, setIsTyping] = useState(false);
  const [displayedInsights, setDisplayedInsights] = useState([]);
  const [typingMessage, setTypingMessage] = useState(TYPING_MESSAGES[0]);
  const [expandedInsight, setExpandedInsight] = useState(null);

  // Simulate AI typing effect when insights change
  useEffect(() => {
    if (insights.length > 0 && isConnected) {
      setIsTyping(true);
      setDisplayedInsights([]);

      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % TYPING_MESSAGES.length;
        setTypingMessage(TYPING_MESSAGES[messageIndex]);
      }, 1500);

      // Show insights one by one
      const timeout = setTimeout(() => {
        clearInterval(messageInterval);
        setIsTyping(false);

        insights.forEach((insight, index) => {
          setTimeout(() => {
            setDisplayedInsights(prev => [...prev, insight]);
          }, index * 300);
        });
      }, 2500);

      return () => {
        clearTimeout(timeout);
        clearInterval(messageInterval);
      };
    }
  }, [insights, isConnected]);

  const handleRefresh = () => {
    setIsTyping(true);
    setDisplayedInsights([]);

    setTimeout(() => {
      setIsTyping(false);
      insights.forEach((insight, index) => {
        setTimeout(() => {
          setDisplayedInsights(prev => [...prev, insight]);
        }, index * 300);
      });
    }, 2000);
  };

  return (
    <div className={clsx('glass-card p-6', !isConnected && 'blur-overlay')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-plaid-blue/20">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-growth"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              AI Insights
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                Gemini
              </span>
            </h2>
            <p className="text-sm text-gray-400">Intelligent spending analysis</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isTyping || !isConnected}
          className={clsx(
            'p-2 rounded-lg transition-all',
            isTyping
              ? 'bg-carbon-700 text-gray-500 cursor-not-allowed'
              : 'bg-carbon-700 hover:bg-carbon-600 text-gray-400 hover:text-white'
          )}
        >
          <RefreshCw className={clsx('w-4 h-4', isTyping && 'animate-spin')} />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3 min-h-[200px]">
        {/* Typing indicator */}
        <AnimatePresence mode="wait">
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-carbon-700/50 rounded-xl border border-carbon-600/50"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15
                    }}
                    className="w-2 h-2 rounded-full bg-purple-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">{typingMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insights List */}
        <AnimatePresence>
          {displayedInsights.map((insight, index) => {
            const Icon = INSIGHT_ICONS[insight.type] || Sparkles;
            const colorClasses = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.neutral;
            const isExpanded = expandedInsight === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={clsx(
                  'p-4 rounded-xl border cursor-pointer transition-all',
                  colorClasses,
                  isExpanded && 'ring-1 ring-white/10'
                )}
                onClick={() => setExpandedInsight(isExpanded ? null : index)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-xl">{insight.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm">{insight.title}</h3>
                      <ChevronRight
                        className={clsx(
                          'w-4 h-4 flex-shrink-0 transition-transform',
                          isExpanded && 'rotate-90'
                        )}
                      />
                    </div>
                    <AnimatePresence>
                      {(isExpanded || index === 0) && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-sm mt-2 text-white/80"
                        >
                          {insight.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {!isTyping && displayedInsights.length === 0 && isConnected && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-carbon-700/50 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">No insights available yet</p>
            <p className="text-gray-500 text-xs mt-1">Connect your bank to get started</p>
          </div>
        )}

        {/* Disconnected state */}
        {!isConnected && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-carbon-700/50 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">AI insights will appear here</p>
            <p className="text-gray-500 text-xs mt-1">Link your account to unlock</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {displayedInsights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-carbon-600/50">
          <p className="text-xs text-gray-500 text-center">
            Powered by Gemini AI • Updated just now
          </p>
        </div>
      )}
    </div>
  );
}

export default GeminiInsightPanel;
