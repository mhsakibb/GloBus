import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import pandas as pd
import os

# Project phases based on May 1 to Aug 30 timeline
tasks = [
    {"Task": "Final Deployment & Report", "Start": "2026-08-20", "End": "2026-08-30"},
    {"Task": "System Testing & Bug Fixing", "Start": "2026-08-05", "End": "2026-08-25"},
    {"Task": "AI Vision & SSLCommerz", "Start": "2026-07-15", "End": "2026-08-15"},
    {"Task": "Core Feature Dev (Cart, Admin)", "Start": "2026-07-01", "End": "2026-08-10"},
    {"Task": "Database Design & Integration", "Start": "2026-06-20", "End": "2026-07-30"},
    {"Task": "Backend Architecture (Node.js)", "Start": "2026-06-15", "End": "2026-07-25"},
    {"Task": "Frontend Dev (React)", "Start": "2026-06-11", "End": "2026-07-15"},
    {"Task": "UI/UX Design", "Start": "2026-05-16", "End": "2026-06-10"},
    {"Task": "Requirement Analysis", "Start": "2026-05-01", "End": "2026-05-15"}
]

df = pd.DataFrame(tasks)
df['Start'] = pd.to_datetime(df['Start'])
df['End'] = pd.to_datetime(df['End'])
df['Duration'] = df['End'] - df['Start']

fig, ax = plt.subplots(figsize=(10, 6))
# Create bar colors (gradient-like effect)
colors = plt.cm.tab10.colors

for i, task in enumerate(df['Task']):
    start_date = mdates.date2num(df['Start'][i])
    end_date = mdates.date2num(df['End'][i])
    ax.barh(task, end_date - start_date, left=start_date, height=0.6, align='center', color=colors[i % len(colors)], alpha=0.8)

# Format the x-axis
ax.xaxis.set_major_locator(mdates.MonthLocator())
ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
ax.xaxis.set_minor_locator(mdates.DayLocator([15])) # tick in middle of month
plt.xticks(rotation=45)

# Add grid lines
ax.grid(True, axis='x', linestyle='--', alpha=0.7)

# Title and labels
plt.title('GloBus Project Timeline (May - Aug 2026)', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('Date', fontsize=12)
plt.ylabel('Phases', fontsize=12)

# Ensure tight layout so labels don't get cut off
plt.tight_layout()

# Save the figure
output_path = r'd:\Project\GloBus\Globus Latex\images\gantt.png'
os.makedirs(os.path.dirname(output_path), exist_ok=True)
plt.savefig(output_path, dpi=300, bbox_inches='tight')
print(f"Gantt chart successfully saved to {output_path}")
