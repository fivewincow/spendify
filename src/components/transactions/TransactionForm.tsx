'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionFormData, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';
import { getTodayString } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateTransaction, useUpdateTransaction, useUploadReceipt } from '@/hooks/useTransactions';
import { Upload, X, Loader2 } from 'lucide-react';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export function TransactionForm({ isOpen, onClose, editTransaction }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(getTodayString());
  const [content, setContent] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [memo, setMemo] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const uploadMutation = useUploadReceipt();

  const isEditing = !!editTransaction;
  const isLoading = createMutation.isPending || updateMutation.isPending || uploadMutation.isPending;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setDate(editTransaction.date);
      setContent(editTransaction.content);
      setAmount(editTransaction.amount.toString());
      setCategory(editTransaction.category);
      setMemo(editTransaction.memo || '');
      setReceiptUrl(editTransaction.receipt_url);
      setReceiptPreview(editTransaction.receipt_url);
    } else {
      resetForm();
    }
  }, [editTransaction, isOpen]);

  useEffect(() => {
    const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as string[];
    if (!allCategories.includes(category) ||
        (type === 'expense' && !(EXPENSE_CATEGORIES as readonly string[]).includes(category)) ||
        (type === 'income' && !(INCOME_CATEGORIES as readonly string[]).includes(category))) {
      setCategory(categories[0]);
    }
  }, [type, categories, category]);

  function resetForm() {
    setType('expense');
    setDate(getTodayString());
    setContent('');
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0]);
    setMemo('');
    setReceiptUrl(null);
    setReceiptPreview(null);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      const url = await uploadMutation.mutateAsync(file);
      setReceiptUrl(url);
    } catch (error) {
      console.error('Failed to upload receipt:', error);
      setReceiptPreview(null);
    }
  }

  function removeReceipt() {
    setReceiptUrl(null);
    setReceiptPreview(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData: TransactionFormData = {
      type,
      date,
      content,
      amount: parseInt(amount, 10),
      category,
      memo: memo || undefined,
      receipt_url: receiptUrl || undefined,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: editTransaction.id, ...formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '내역 수정' : '새 내역 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'expense' ? 'default' : 'outline'}
              className={`flex-1 ${type === 'expense' ? 'bg-red-500 hover:bg-red-600' : ''}`}
              onClick={() => setType('expense')}
            >
              지출
            </Button>
            <Button
              type="button"
              variant={type === 'income' ? 'default' : 'outline'}
              className={`flex-1 ${type === 'income' ? 'bg-green-500 hover:bg-green-600' : ''}`}
              onClick={() => setType('income')}
            >
              수입
            </Button>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">날짜</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="content">내용</Label>
            <Input
              id="content"
              placeholder="예: 점심 식사"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">금액</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label>카테고리</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Memo */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="memo">메모 (선택)</Label>
            <Textarea
              id="memo"
              placeholder="메모를 입력하세요"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
            />
          </div>

          {/* Receipt Upload */}
          <div className="flex flex-col gap-2">
            <Label>영수증 이미지 (선택)</Label>
            {receiptPreview ? (
              <div className="relative">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="w-full h-40 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removeReceipt}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">클릭하여 이미지 업로드</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              isEditing ? '수정하기' : '추가하기'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
