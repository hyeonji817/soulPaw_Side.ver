export const displayOrderNumber = (order: {id:string;created_at:string}) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(order.created_at));
  const part = (type: string) => parts.find(value => value.type === type)?.value || '';
  return `${part('year')}${part('month')}${part('day')}-${String(order.id).padStart(6, '0')}`;
};
