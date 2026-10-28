// Nhãn + màu badge cho từng độ khó (dùng chung cho card và bộ lọc)
export const DIFFICULTY_META = {
  EASY: {
    label: 'Dễ',
    badgeClass: 'bg-[var(--color-success-tint)] text-[var(--color-success-strong)]',
    dotClass: 'bg-[var(--color-success-bright)]',
  },
  MEDIUM: {
    label: 'Trung bình',
    badgeClass: 'bg-[var(--color-warning-tint)] text-[var(--color-warning-deep)]',
    dotClass: 'bg-[var(--color-warning-border)]',
  },
  HARD: {
    label: 'Khó',
    badgeClass: 'bg-[var(--color-danger-tint)] text-[var(--color-danger-strong)]',
    dotClass: 'bg-[var(--color-danger-bright)]',
  },
  EXPERT: {
    label: 'Chuyên gia',
    badgeClass: 'bg-[var(--color-pastel-lavender)] text-[var(--color-ink)]',
    dotClass: 'bg-[var(--color-decor-lilac)]',
  },
};
