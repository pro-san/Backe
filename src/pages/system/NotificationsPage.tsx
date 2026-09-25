import React, { useState } from 'react';
import { useNotifications, useMarkNotificationAsRead } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/formatters';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, Calendar, BedDouble } from 'lucide-react';
import { toast } from '../../stores/toastStore';

export const NotificationsPage: React.FC = () => {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const [filterUnread, setFilterUnread] = useState(false);

  const isItemRead = (n: any) => Boolean(n.read || n.is_read);

  const displayedList = filterUnread
    ? notifications.filter((n) => !isItemRead(n))
    : notifications;

  const handleMarkAllAsRead = async () => {
    for (const n of notifications) {
      if (!isItemRead(n)) {
        await markAsReadMutation.mutateAsync(n.id);
      }
    }
    toast.success('All hospital notifications marked as read.');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <PageHeader
        title="Clinical Alerts & Notifications Center"
        description="System events, laboratory result releases, pharmacy stock alerts, and patient triage updates."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Notifications' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={filterUnread ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterUnread(!filterUnread)}
            >
              {filterUnread ? 'Show All' : 'Unread Only'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Notification Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {displayedList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No notifications matching current filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedList.map((item) => {
                const read = isItemRead(item);
                return (
                  <div
                    key={item.id}
                    className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                      !read
                        ? 'bg-sky-50/40 dark:bg-sky-950/20'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs">
                        {getIcon(item.type)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h4>
                          {!read && (
                            <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[10px] text-slate-400 block pt-1 tabular-nums">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                    </div>

                    {!read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsReadMutation.mutateAsync(item.id)}
                        className="h-7 text-xs text-sky-600 hover:text-sky-700 shrink-0"
                      >
                        Dismiss
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
