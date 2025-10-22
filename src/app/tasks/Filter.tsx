'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TaskStatusFilter({
  initialStatus,
}: {
  initialStatus?: 'TODO' | 'IN_PROGRESS' | 'DONE';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const onChange = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === 'ALL') next.delete('status');
    else next.set('status', value);
    const newPath = `${pathname}${next.toString() ? `?${next.toString()}` : ''}`;
    router.push(newPath as Parameters<typeof router.push>[0]);
  };
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm">Status</label>
      <Select value={initialStatus || 'ALL'} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="TODO">Todo</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
