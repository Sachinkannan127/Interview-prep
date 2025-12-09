import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Download, ArrowLeft, Trophy } from 'lucide-react';
import { 
  getScoreBadgeColor, 
  formatScore,
  getOverallRating 
} from '../utils/scoreRanges';

export default function InterviewResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [id]);

  const loadResults = async () => {
    try {
      const data = await interviewAPI.getInterview(id!);
      setInterview(data);
    } catch (error) {
      toast.error('Failed to load interview results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDFResults = () => {
    if (!interview) return;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text('Interview Results', 10, y);
    y += 10;
    doc.setFontSize(12);
    const interviewId = String(interview.id ?? '');
    doc.text(`Interview ID: ${interviewId}`, 10, y);
    y += 8;
    const startedAtStr = interview.startedAt ? String(interview.startedAt) : '';
    const endedAtStr = interview.endedAt ? String(interview.endedAt) : '';
    doc.text(`Started At: ${startedAtStr}`, 10, y);
    y += 8;
    doc.text(`Ended At: ${endedAtStr}`, 10, y);
    y += 8;
    const overallScore = interview.overallScore?.toFixed(1) || avgScore.toFixed(1);
    doc.text(`Overall Score: ${overallScore}`, 10, y);
    y += 8;
    const qaLength = String(interview.qa.length);
    doc.text(`Questions Answered: ${qaLength}`, 10, y);
    y += 8;
    const avgResponseTime = interview.metrics?.avgResponseTime?.toFixed(1) || '0';
    doc.text(`Avg Response Time: ${avgResponseTime}s`, 10, y);
    y += 8;
    let totalDuration = 'N/A';
    if (endedAtStr && startedAtStr) {
      const start = new Date(startedAtStr);
      const end = new Date(endedAtStr);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        totalDuration = formatDuration((end.getTime() - start.getTime()) / 1000);
      }
    }
    doc.text(`Total Duration: ${totalDuration}`, 10, y);
    y += 10;
    doc.text('Interview Configuration:', 10, y);
    y += 8;
    Object.entries(interview.config || {}).forEach(([key, value]) => {
      const keyStr = String(key);
      const valueStr = String(value ?? '');
      doc.text(`${keyStr}: ${valueStr}`, 12, y);
      y += 7;
    });
    y += 5;
    doc.text('Questions & Answers:', 10, y);
    y += 8;
    interview.qa.forEach((qa: any, idx: number) => {
      doc.setFont('helvetica', 'bold');
      const questionText = String(qa.questionText ?? '');
      doc.text(`Q${idx + 1}: ${questionText}`, 12, y);
      doc.setFont('helvetica', 'normal');
      y += 7;
      const answerText = String(qa.answerText ?? '');
      doc.text(`Your Answer: ${answerText}`, 14, y);
      y += 7;
      const scoreText = String(qa.aiScore ?? '');
      doc.text(`Score: ${scoreText}/100`, 14, y);
      y += 7;
      if (qa.aiFeedback) {
        const feedbackText = String(qa.aiFeedback);
        doc.text(`AI Feedback: ${feedbackText}`, 14, y);
        y += 7;
      }
      const responseTime = formatDuration((qa.endTs - qa.startTs) / 1000);
      doc.text(`Response Time: ${responseTime}`, 14, y);
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });
    if (interview.transcript) {
      doc.text('Full Transcript:', 10, y);
      y += 8;
      const transcriptLines = interview.transcript.split('\n');
      transcriptLines.forEach((line: string) => {
        const lineText = String(line ?? '');
        doc.text(lineText, 12, y);
        y += 6;
        if (y > 270) {
          doc.addPage();
          y = 10;
        }
      });
    }
    doc.save(`interview-results-${interview.id}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 flex items-center justify-center">
        <div className="animate-pulse text-primary-500 text-xl">Loading results...</div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-800 mb-4">Interview Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const avgScore = interview.qa.length > 0
    ? interview.qa.reduce((sum: number, qa: any) => sum + (qa.aiScore || 0), 0) / interview.qa.length
    : 0;

  const overallRating = getOverallRating(interview.overallScore?.toFixed(1) || avgScore);

  return (
    <>
      <Helmet>
        <title>Interview Results - InterviewAI</title>
        <meta name="description" content="View your interview performance and download detailed results." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-dark-600 hover:text-dark-800">
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <button onClick={downloadPDFResults} className="btn-primary flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>

          {/* Header */}
          <div className="card mb-8">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-dark-800 mb-2">Interview Complete!</h1>
              <p className="text-dark-600 mb-4">Here's how you performed</p>
              
              {/* Overall Rating */}
              <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                <div className="text-4xl mb-2">{overallRating.emoji}</div>
                <div className="text-2xl font-bold text-primary-700 mb-1">{overallRating.rating}</div>
                <div className="text-sm text-primary-600">{overallRating.message}</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{interview.overallScore?.toFixed(1) || avgScore.toFixed(1)}</div>
                  <div className="text-sm text-dark-600">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{interview.qa.length}</div>
                  <div className="text-sm text-dark-600">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{interview.metrics?.avgResponseTime?.toFixed(1) || '0'}</div>
                  <div className="text-sm text-dark-600">Avg Response Time (s)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {(() => {
                      const startedAtStr = interview.startedAt ? String(interview.startedAt) : '';
                      const endedAtStr = interview.endedAt ? String(interview.endedAt) : '';
                      if (endedAtStr && startedAtStr) {
                        const start = new Date(startedAtStr);
                        const end = new Date(endedAtStr);
                        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                          return formatDuration((end.getTime() - start.getTime()) / 1000);
                        }
                      }
                      return 'N/A';
                    })()}
                  </div>
                  <div className="text-sm text-dark-600">Total Duration</div>
                </div>
              </div>

              <button onClick={downloadPDFResults} className="btn-primary flex items-center gap-2 mx-auto">
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Interview Configuration */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-dark-800 mb-4">Interview Configuration</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-dark-600">Type</div>
                <div className="font-medium text-dark-800 capitalize">{interview.config?.type}</div>
              </div>
              <div>
                <div className="text-sm text-dark-600">Industry</div>
                <div className="font-medium text-dark-800">{interview.config?.industry}</div>
              </div>
              <div>
                <div className="text-sm text-dark-600">Role</div>
                <div className="font-medium text-dark-800">{interview.config?.role}</div>
              </div>
              <div>
                <div className="text-sm text-dark-600">Difficulty</div>
                <div className="font-medium text-dark-800 capitalize">{interview.config?.difficulty}</div>
              </div>
              <div>
                <div className="text-sm text-dark-600">Duration</div>
                <div className="font-medium text-dark-800">{interview.config?.durationMinutes} minutes</div>
              </div>
              <div>
                <div className="text-sm text-dark-600">Voice Enabled</div>
                <div className="font-medium text-dark-800">{interview.config?.voiceEnabled ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          {/* Questions and Answers */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-dark-800 mb-4">Questions & Answers</h2>
            <div className="space-y-4">
              {interview.qa.map((qa: any, index: number) => (
                <div key={index} className="border border-dark-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-dark-800">Question {index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreBadgeColor(qa.aiScore)}`}>
                        {formatScore(qa.aiScore, true)}
                      </span>
                      <span className="text-sm text-dark-600">
                        {formatDuration((qa.endTs - qa.startTs) / 1000)}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm text-dark-600 mb-1">Question:</div>
                    <div className="text-dark-800">{qa.questionText}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm text-dark-600 mb-1">Your Answer:</div>
                    <div className="text-dark-800 bg-dark-50 p-3 rounded">{qa.answerText}</div>
                  </div>
                  {qa.aiFeedback && (
                    <div>
                      <div className="text-sm text-dark-600 mb-1">AI Feedback:</div>
                      <div className="text-dark-700">{qa.aiFeedback}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Transcript (if available) */}
          {interview.transcript && (
            <div className="card">
              <h2 className="text-xl font-bold text-dark-800 mb-4">Full Transcript</h2>
              <div className="bg-dark-50 p-4 rounded-lg">
                <pre className="text-sm text-dark-700 whitespace-pre-wrap">{interview.transcript}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}