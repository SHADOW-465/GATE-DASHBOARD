# GATE 2026 ECE Dashboard - Features

## 1. Dashboard

### 1.1. Main Dashboard (`app/page.tsx`)

-   **Greeting and Course Title**: Displays a prominent "GATE 2026 ECE" title and a descriptive subtitle.
-   **Motivation Widget**: A card that shows:
    -   Study Streak with a "On Fire!" badge.
    -   Target score.
    -   Days remaining for the exam.
    -   A daily motivational quote.
-   **Study Overview**: A comprehensive card that provides:
    -   Overall progress percentage towards the target score.
    -   A list of all subjects with:
        -   Individual progress bars.
        -   Status badges (e.g., "strong," "pending," "weak").
        -   Weightage of each subject in the exam.
-   **Today's Schedule**: A card that lists the study tasks for the current day with:
    -   Time slots.
    -   Task type (Theory, PYQs, Mock Test, Revision).
    -   Subject and topic details.
    -   Status of the task (e.g., "pending," "completed").
-   **Progress Summary**: A card that summarizes key performance indicators:
    -   Overall Progress.
    -   Target Score.
    -   Study Hours.
    -   Study Streak.
-   **Quick Actions**: A card providing buttons for frequent actions:
    -   Start Pomodoro timer.
    -   Add a new task (opens a dialog).
    -   Practice weak topics.

## 2. Study Planner (`app/study-planner/page.tsx`)

-   **Study Calendar**: An interactive calendar to visualize and manage the study schedule.
    -   Users can select a date to view the planned sessions for that day.
    -   Displays events with type, subject, topic, time, and status.
    -   Option to add new tasks to the calendar.
-   **Task Manager**: A tool to manage study tasks.
    -   Add new tasks with subject and type.
    -   View a list of tasks with priority indicators.
    -   Update task status (completed, revise-again, pending).
    -   Drag-and-drop functionality for task organization.
-   **Weekly Goals**: A card to set and track weekly study goals.
    -   Displays goals for different subjects with progress bars.
    -   Shows due dates and status (on-track, completed, behind).
-   **Subject Planner**: A component to plan and track progress for each subject.
    -   Shows progress, weekly hours vs. target hours, and status for each subject.
    -   Indicates the next topic to be studied for each subject.
    -   Option to add new subjects to the planner.

## 3. Progress Tracker (`app/progress/page.tsx`)

-   **Progress Summary**: A detailed summary of the user's progress with metrics like overall progress, target score, study hours, and streak.
-   **Study Streak**: A card dedicated to visualizing the study streak.
    -   Shows current streak, best streak, and total study days in the month.
    -   A weekly view of study consistency.
-   **Progress Charts**: Visual representations of study data.
    -   A Pie Chart showing syllabus coverage by subject.
    -   A stacked Bar Chart for weekly study hours, broken down by activity (Theory, PYQs, Mock, Revision).
-   **Subject Analytics**: In-depth analysis of performance in each subject.
    -   Shows overall accuracy and trend (improving, stable, declining).
    -   Identifies the strongest and weakest topics within each subject.
-   **Weekly Review**: A card that provides a review of the past weeks' performance.
    -   Total study hours vs. target hours.
    -   Breakdown of hours spent on each subject.
    -   Lists achievements and areas for improvement for each week.

## 4. Test & Practice (`app/tests/page.tsx`)

-   **Test Overview**: A summary of test performance, including:
    -   Number of mock tests taken.
    -   Average score.
    -   Time management stats.
    -   Number of identified weak areas.
-   **Mock Test Simulator**: A feature to take mock tests in a simulated exam environment.
    -   Lists available mock tests with details like type, duration, and difficulty.
    -   Option to start or retake tests.
-   **PYQ Practice**: A section for practicing with previous year questions.
    -   Year-wise and subject-wise practice sets.
    -   Tracks progress, number of solved questions, and accuracy.
-   **Test Performance**: A line chart to visualize performance trends over multiple tests, showing scores and accuracy.
-   **Error Analysis**: A component that helps in analyzing mistakes made in tests.
    -   Lists topics with a high number of errors.
    -   Shows accuracy, number of attempts, and trend for each topic.
    -   Provides options to study the topic or practice more questions.

## 5. Revision Hub (`app/revision/page.tsx`)

-   **Formula Sheet**: A quick reference for important formulas.
    -   Formulas are categorized by subject.
    -   Search functionality to find specific formulas.
    -   Option to add new formulas and mark favorites.
-   **Flashcard System**: A tool for learning and revision using spaced repetition.
    -   Decks of flashcards for different subjects and topics.
    -   Tracks mastery level for each deck.
    -   Interactive flashcard view with options to show the answer and rate the difficulty.
-   **Weak Topics**: A dedicated section to focus on weak areas identified from test performances.
-   **Quick Revision**: Short, focused revision sessions for quick review of topics.
-   **Revision Planner**: A planner to schedule revision sessions based on spaced repetition.

## 6. Analytics (`app/analytics/page.tsx`)

-   **Date Range Picker**: Allows users to filter analytics data by a specific date range.
-   **Analytics Overview**: A comprehensive overview of all analytics with key metrics and charts.
-   **Study Analytics**: Detailed analytics on study patterns and efficiency.
    -   Daily study pattern visualization.
    -   Learning efficiency trends.
    -   Subject mastery radar chart.
-   **Performance Reports**: In-depth reports on performance.
    -   Monthly performance summaries.
    -   Score progression by subject.
    -   Year-over-year comparison of study hours.
-   **Predictive Analytics**: AI-powered predictions and recommendations.
    -   GATE score prediction chart.
    -   Probability of achieving target scores.
    -   Subject-wise performance forecasts.
    -   Risk analysis with mitigation strategies.

## 7. Productivity Tools (`app/productivity/page.tsx`)

-   **Pomodoro Timer**: A timer to help with focused study sessions.
    -   Different modes like Pomodoro, Short Break, Long Break, and Deep Focus.
    -   Tracks completed sessions.
-   **Focus Mode**: A feature to block distractions.
    -   Different focus modes with varying levels of restrictions.
    -   Customizable list of distractions to block.
-   **Motivation Center**: A component to keep the user motivated.
    -   Daily motivational quotes.
    -   Tracking of important milestones.
    -   Daily affirmations.
-   **Achievement Badges**: A gamified system to reward progress.
    -   Badges for various achievements like consistency, completing study hours, and mastering subjects.
    -   Tracks earned badges and progress towards locked ones.
-   **Study Goals**: A tool to set and track long-term study goals.
-   **Productivity Stats**: Analytics on productivity metrics like focus score, deep work hours, and distraction rate.

## 8. Settings (`app/settings/page.tsx`)

-   **Account Settings**: Manage user profile information like name, email, phone, and avatar.
-   **Security Settings**: Options to change the password and enable two-factor authentication.
-   **Preferences**: Customize the dashboard experience, including language, theme (light/dark/system), and layout.
-   **Notifications**: Manage notification preferences for different channels and types of notifications.
-   **Privacy**: Control data sharing and account visibility settings.

## 9. General Features

-   **Responsive Design**: The dashboard is designed to be accessible and user-friendly across devices of all sizes.
-   **Theme Toggling**: Users can switch between light and dark themes.
-   **Collapsible Sidebar**: The sidebar can be collapsed to provide more screen space for the main content.
-   **Notifications**: A notification center to alert users about important updates and reminders.
