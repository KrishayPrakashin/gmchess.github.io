import React, { useState } from 'react';
import { CHESS_LESSONS, ChessLesson } from '../chess/lessons';
import { Chess } from 'chess.js';
import { Chessboard } from './Chessboard';
import { GraduationCap, Clock, CheckCircle, ChevronRight, BookOpen } from 'lucide-react';

interface LessonsViewProps {
  boardTheme: any;
  pieceTheme: any;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ boardTheme, pieceTheme }) => {
  const [selectedLesson, setSelectedLesson] = useState<ChessLesson>(CHESS_LESSONS[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left: Lessons Directory */}
      <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 flex flex-col">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
          <GraduationCap className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Grandmaster Academy
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[520px]">
          {CHESS_LESSONS.map((lesson) => {
            const isSelected = selectedLesson.id === lesson.id;
            return (
              <div
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                      {lesson.categoryLabel}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {lesson.durationMinutes}m
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 truncate max-w-[200px]">
                    {lesson.title}
                  </h4>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Selected Lesson Content & Interactive Demonstration Board */}
      <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        {/* Header */}
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span>{selectedLesson.categoryLabel}</span>
            <span>·</span>
            <span>{selectedLesson.durationMinutes} min read</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">{selectedLesson.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{selectedLesson.subtitle}</p>
        </div>

        {/* Lesson Points */}
        <div className="space-y-2.5">
          {selectedLesson.content.map((paragraph, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed"
            >
              {paragraph}
            </div>
          ))}
        </div>

        {/* Interactive Board Demonstration if FEN present */}
        {selectedLesson.fen && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Demonstration Position
            </span>
            <div className="max-w-[320px] mx-auto">
              <Chessboard
                game={new Chess(selectedLesson.fen)}
                onMove={() => false}
                boardTheme={boardTheme}
                pieceTheme={pieceTheme}
                showCoordinates={true}
                showLegalMoves={false}
                interactive={false}
              />
            </div>
          </div>
        )}

        {/* Key Takeaway Box */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 block mb-0.5">Key Tactical Principle:</strong>
            <span>{selectedLesson.keyTakeaway}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
