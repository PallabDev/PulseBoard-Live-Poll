import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePolls } from '../../hooks/useLocalPolls';
import { pollService } from '../../services/poll.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RichTextEditor } from '../../components/shared/RichTextEditor';
import { Loader2, ArrowLeft, Save, Plus, GripVertical, Trash2, Edit2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';

interface OptionForm {
    id: string;
    text: string;
    order: number;
}

interface QuestionForm {
    id: string;
    question: string;
    options: OptionForm[];
}

// Strip HTML for the summary view
const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "Empty text...";
};

export const PollBuilder: React.FC = () => {
    const { pollId } = useParams();
    const isEditing = !!pollId;
    const navigate = useNavigate();
    const { addPoll, updatePollLocal } = usePolls();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [pollName, setPollName] = useState('');
    const [pollDescription, setPollDescription] = useState('');
    const [pollDurationInMinutes, setPollDurationInMinutes] = useState(5);
    const [isAnonymousAllowed, setIsAnonymousAllowed] = useState(false);
    const [status, setStatus] = useState<'draft' | 'active'>('draft');

    const [questions, setQuestions] = useState<QuestionForm[]>([
        {
            id: `q-${Date.now()}`,
            question: '',
            options: [
                { id: `o-${Date.now()}-1`, text: '', order: 1 },
                { id: `o-${Date.now()}-2`, text: '', order: 2 },
            ]
        }
    ]);

    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);

    useEffect(() => {
        if (isEditing) {
            const loadEditData = async () => {
                setIsLoading(true);
                try {
                    const res = await pollService.getPollById(pollId!);
                    if (res.success && res.data) {
                        const { poll, questions: apiQuestions } = res.data;

                        setPollName(poll.pollName);
                        setPollDescription(poll.pollDescription);
                        setPollDurationInMinutes(poll.pollDurationInMinutes);
                        setIsAnonymousAllowed(poll.isAnonymousAllowed);
                        setStatus(poll.status as 'draft' | 'active');

                        if (apiQuestions && apiQuestions.length > 0) {
                            setQuestions(apiQuestions.map((q: any) => ({
                                id: q._id || q.id,
                                question: q.question,
                                options: q.options.map((o: any) => ({
                                    id: o._id || o.id,
                                    text: o.text,
                                    order: o.order
                                }))
                            })));
                        }
                        setDeletedQuestionIds([]);
                    } else {
                        throw new Error("Failed to load poll");
                    }
                } catch (error) {
                    console.error("Failed to load poll", error);
                    toast.error("Failed to load poll for editing. It might not exist.");
                    navigate('/dashboard');
                } finally {
                    setIsLoading(false);
                }
            };
            loadEditData();
        }
    }, [isEditing, pollId, navigate]);

    const handleSave = async () => {
        if (!pollName.trim()) {
            toast.error("Poll name is required");
            return;
        }

        setIsSaving(true);
        try {
            let currentPollId = pollId;

            const pollPayload = {
                pollName,
                pollDescription,
                pollDurationInMinutes,
                isAnonymousAllowed,
                status
            };

            if (isEditing && currentPollId) {
                await pollService.updatePoll(currentPollId, pollPayload);
                updatePollLocal(currentPollId, pollPayload);

                for (const questionId of deletedQuestionIds) {
                    await pollService.deleteQuestion(currentPollId, questionId);
                }

                const savedQuestions: QuestionForm[] = [];

                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    if (q.id.startsWith('q-')) {
                        const newQRes = await pollService.createQuestion(currentPollId, {
                            question: q.question || '<p>Empty Question</p>',
                            questionNumber: i + 1,
                            options: q.options.map((o, index) => ({ text: o.text || 'Empty Option', order: index + 1 }))
                        });
                        if (newQRes.success && newQRes.data) {
                            savedQuestions.push({
                                ...q,
                                id: newQRes.data._id || newQRes.data.id,
                            });
                        }
                    } else {
                        await pollService.updateQuestion(currentPollId, q.id, {
                            question: q.question
                        });
                        for (const o of q.options) {
                            if (!o.id.startsWith('o-')) {
                                await pollService.updateOption(currentPollId, q.id, o.id, {
                                    text: o.text
                                });
                            }
                        }
                        savedQuestions.push(q);
                    }
                }

                setQuestions(savedQuestions);
                setDeletedQuestionIds([]);

                const orderPayload = savedQuestions.map((q, index) => ({
                    questionId: q.id,
                    questionNumber: index + 1
                }));

                if (orderPayload.length > 0) {
                    await pollService.updateQuestionOrder(currentPollId, orderPayload);
                }

                toast.success("Poll updated successfully");
            } else {
                const createRes = await pollService.createPoll(pollPayload);
                if (createRes.success && createRes.data) {
                    currentPollId = createRes.data._id || createRes.data.id;
                    addPoll(createRes.data);

                    for (let i = 0; i < questions.length; i++) {
                        const q = questions[i];
                        await pollService.createQuestion(currentPollId!, {
                            question: q.question || '<p>Empty Question</p>',
                            questionNumber: i + 1,
                            options: q.options.map((o, index) => ({ text: o.text || 'Empty Option', order: index + 1 }))
                        });
                    }
                    toast.success("Poll created successfully");
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save poll");
        } finally {
            setIsSaving(false);
        }
    };

    const addQuestion = () => {
        const newId = `q-${Date.now()}`;
        setQuestions([
            ...questions,
            {
                id: newId,
                question: '',
                options: [
                    { id: `o-${Date.now()}-1`, text: '', order: 1 },
                    { id: `o-${Date.now()}-2`, text: '', order: 2 },
                ]
            }
        ]);
        setEditingQuestionId(newId);
    };

    const removeQuestion = (qIndex: number) => {
        const questionToRemove = questions[qIndex];

        if (isEditing && questionToRemove && !questionToRemove.id.startsWith('q-')) {
            setDeletedQuestionIds((prev) => (
                prev.includes(questionToRemove.id) ? prev : [...prev, questionToRemove.id]
            ));
        }

        if (editingQuestionId === questionToRemove?.id) {
            setEditingQuestionId(null);
        }

        setQuestions(questions.filter((_, i) => i !== qIndex));
    };

    const addOption = (qId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                if (q.options.length >= 4) {
                    toast.error("Maximum 4 options allowed");
                    return q;
                }
                return {
                    ...q,
                    options: [...q.options, { id: `o-${Date.now()}`, text: '', order: q.options.length + 1 }]
                };
            }
            return q;
        }));
    };

    const removeOption = (qId: string, oId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                if (q.options.length <= 2) {
                    toast.error("Minimum 2 options required");
                    return q;
                }
                return {
                    ...q,
                    options: q.options.filter(o => o.id !== oId)
                };
            }
            return q;
        }));
    };

    const updateQuestionText = (qId: string, text: string) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, question: text } : q));
    };

    const updateOptionText = (qId: string, oId: string, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    options: q.options.map(o => o.id === oId ? { ...o, text } : o)
                };
            }
            return q;
        }));
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(questions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setQuestions(items);
    };

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-500" /></div>;
    }

    const editingQuestion = questions.find(q => q.id === editingQuestionId);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                        {isEditing ? 'Edit Poll' : 'Create Poll'}
                    </h1>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
                        onClick={() => setStatus(status === 'draft' ? 'active' : 'draft')}
                    >
                        Status: {status}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
                    >
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Poll
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-5 space-y-6">
                    <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Poll Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="pollName" className="text-zinc-300">Name</Label>
                                <Input
                                    id="pollName"
                                    value={pollName}
                                    onChange={(e) => setPollName(e.target.value)}
                                    placeholder="Weekly Standup Feedback"
                                    className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">Description</Label>
                                <RichTextEditor
                                    content={pollDescription}
                                    onChange={setPollDescription}
                                    placeholder="Describe the purpose of this poll..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration" className="text-zinc-300">Duration (Minutes)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    value={pollDurationInMinutes}
                                    onChange={(e) => setPollDurationInMinutes(Number(e.target.value))}
                                    className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-700"
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-zinc-300">Anonymous Responses</Label>
                                    <div className="text-sm text-zinc-500">Allow users to vote without logging in.</div>
                                </div>
                                <Switch
                                    checked={isAnonymousAllowed}
                                    onCheckedChange={setIsAnonymousAllowed}
                                    className="data-[state=checked]:bg-zinc-50"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-zinc-50">Questions</h2>
                        <Button variant="outline" size="sm" onClick={addQuestion} className="border-zinc-700 hover:bg-zinc-800">
                            <Plus className="h-4 w-4 mr-2" /> Add Question
                        </Button>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="questions-list">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    {questions.map((q, index) => (
                                        <Draggable key={q.id} draggableId={q.id} index={index}>
                                            {(provided) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="border-zinc-800 bg-zinc-900/40 backdrop-blur-sm group"
                                                >
                                                    <div className="flex items-center p-4">
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="cursor-grab hover:text-zinc-300 text-zinc-500 mr-4"
                                                        >
                                                            <GripVertical className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 flex flex-col min-w-0 pr-4">
                                                            <span className="text-xs font-medium text-zinc-500 mb-1">Question {index + 1}</span>
                                                            <span className="truncate font-medium text-zinc-300">
                                                                {q.question ? stripHtml(q.question) : 'Untitled Question'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setEditingQuestionId(q.id)}
                                                                className="border-zinc-700 bg-zinc-950/50 hover:bg-zinc-800"
                                                            >
                                                                <Edit2 className="h-3 w-3 mr-2" /> Edit
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeQuestion(index)}
                                                                className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                                                disabled={questions.length <= 1}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>

            <Dialog open={!!editingQuestionId} onOpenChange={(open) => !open && setEditingQuestionId(null)}>
                <DialogContent className="sm:max-w-175 bg-zinc-950 border-zinc-800 text-zinc-50 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-6 pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
                        <DialogTitle className="text-xl">Edit Question</DialogTitle>
                    </DialogHeader>

                    {editingQuestion && (
                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            <div className="space-y-3">
                                <Label className="text-base text-zinc-300">Question Text</Label>
                                <RichTextEditor
                                    content={editingQuestion.question}
                                    onChange={(val) => updateQuestionText(editingQuestion.id, val)}
                                    placeholder="Ask something..."
                                    minHeight="120px"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base text-zinc-300">Options ({editingQuestion.options.length}/4)</Label>
                                    {editingQuestion.options.length < 4 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addOption(editingQuestion.id)}
                                            className="border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Add Option
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {editingQuestion.options.map((opt, oIndex) => (
                                        <div key={opt.id} className="relative rounded-md border border-zinc-800 bg-zinc-900/20 p-1">
                                            <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center border-r border-zinc-800 bg-zinc-950/50 text-zinc-500 font-medium text-xs rounded-l-md z-10">
                                                {String.fromCharCode(65 + oIndex)}
                                            </div>
                                            <div className="pl-8 relative group">
                                                <RichTextEditor
                                                    content={opt.text}
                                                    onChange={(val) => updateOptionText(editingQuestion.id, opt.id, val)}
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    minHeight="80px"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeOption(editingQuestion.id, opt.id)}
                                                    disabled={editingQuestion.options.length <= 2}
                                                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-950 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="p-4 border-t border-zinc-800 bg-zinc-900/20">
                        <Button
                            onClick={() => setEditingQuestionId(null)}
                            className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
                        >
                            Done Editing
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
