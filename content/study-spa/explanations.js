// Auto-generated explanations for CompTIA SecAI+ CY0-001 practice questions
const EXPLANATIONS = {
  "1": {
    "correct": "<strong>A)</strong> <code>$2,466.18</code> is the correct calculated answer. <br><em>Formula reminder:</em> Mean = Sum of all values ÷ Number of values",
    "wrong": "<strong>B)</strong> <em>$2,667.60</em> — incorrect calculation result. <strong>C)</strong> <em>$3,082.72</em> — incorrect calculation result. <strong>D)</strong> <em>$12,330.88</em> — incorrect calculation result.",
    "domain": "Data Analysis & Statistics"
  },
  "2": {
    "correct": "<strong>D)</strong> <strong>A dashboard with filters at the top that the user can toggle</strong> is the correct answer. <br><strong>What it is:</strong> A dashboard with filters at the top that the user can toggle is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. <br><strong>Why correct here:</strong> Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights.",
    "wrong": "<strong>A)</strong> <em>A workbook with multiple tabs for each region</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>A daily email with snapshots of regional summaries</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>A static report with a different page for every filtered view</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "3": {
    "correct": "<strong>D)</strong> <strong>Normalize the variables.</strong> is the correct answer. <br><strong>Concept:</strong> Normalization scales numeric features to a comparable range (e.g., z-scores or min–max) so no single variable dominates an average or weighted score just because its units are larger. <br><strong>Why correct here:</strong> Credit cards, age, and income are on different scales; averaging them raw would overweight income. Normalizing gives each dimension fair weight in a 0–100 score.",
    "wrong": "<strong>A)</strong> <em>Recode the variables.</em> — Recoding changes labels or categories; it does not fix scale differences between continuous inputs for a combined score.<br><strong>B)</strong> <em>Calculate the percentiles of the variables.</em> — Percentiles rank values within each variable but do not by themselves produce comparable scaled inputs for a simple average score across three different measures.<br><strong>C)</strong> <em>Calculate the standard deviations of the variables.</em> — Standard deviation describes spread; knowing SD alone does not rescale variables so they contribute equally to an average-based score.",
    "domain": "Data Analysis & Statistics"
  },
  "4": {
    "correct": "<strong>D and E)</strong> <strong>Data encryption</strong> and <strong>data masking</strong> are correct (choose two). <br><strong>Why:</strong> When <em>transmitting</em> data, <strong>encryption</strong> (e.g., TLS) protects confidentiality and integrity in transit so intercepted traffic stays unreadable without keys. <strong>Masking</strong> limits exposure of sensitive values (substitution, tokenization, showing only needed fragments) so even if data moves between systems, sensitive content is not fully disclosed. Together they align with data-governance guidance on protecting data in motion and reducing leak impact.",
    "wrong": "<strong>A)</strong> <em>Data identification</em> — Classifying or labeling data is important for governance but is not, by itself, a transmission control that mitigates leaks the way crypto or masking does.<br><strong>B)</strong> <em>Data processing</em> — Processing is a broad term for working with data; it is not a specific mitigation for leaks during transmission.<br><strong>C)</strong> <em>Data reporting</em> — Reporting presents results; it does not inherently protect data while it is being sent across a network.<br><strong>F)</strong> <em>Data removal</em> — Deleting or purging data can reduce what could leak, but it is not the paired best practice with encryption for protecting data <em>in transit</em> the way masking is.",
    "domain": "Visualization & Reporting"
  },
  "5": {
    "correct": "<strong>D)</strong> <strong>Sorting</strong> is the correct answer. <br><strong>What it is:</strong> Sorting is arranging data in ascending or descending order based on one or more columns. <br><strong>Why correct here:</strong> Fundamental data operation for ranking, display, and identifying extremes.",
    "wrong": "<strong>A)</strong> <em>Conditional formatting</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Grouping</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Filtering</em> — This is selecting a subset of data that meets specified criteria. Example: selecting only customers from California, or transactions over $1,000. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "6": {
    "correct": "<strong>D)</strong> <strong>Invalid data type</strong> is the correct answer. <br><strong>What it is:</strong> Invalid data type is a classification that specifies what kind of value a variable holds (e.g., integer, string, boolean, float). <br><strong>Why correct here:</strong> Determines what operations can be performed on the data and how much storage it requires.",
    "wrong": "<strong>A)</strong> <em>Duplicate data</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Missing data</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data outliers</em> — This is a data point that is significantly different from the rest of the dataset. Can distort the mean and standard deviation. Often handled by removing, capping, or transforming the value. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "7": {
    "correct": "<strong>B)</strong> <strong>ETL</strong> is the correct answer. <br><strong>What it is:</strong> ETL is Extract, Transform, Load — a data integration process that extracts data from sources, transforms it into the required format, and loads it into a target system. <br><strong>Why correct here:</strong> The standard pipeline for populating data warehouses. Transformation includes cleaning, deduplication, and enrichment.",
    "wrong": "<strong>A)</strong> <em>MDM</em> — This is Master Data Management — the creation and maintenance of a single authoritative source of key business entities. Ensures consistency of critical data like customer, product, and vendor records across systems. It does not answer this question correctly.<br><strong>C)</strong> <em>OLTP</em> — This is Online Transaction Processing — systems designed to manage high volumes of short, atomic transactions in real time. Examples: point-of-sale systems, online banking. Optimized for inserts, updates, and deletes. It does not answer this question correctly.<br><strong>D)</strong> <em>BI</em> — This is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. Tools include Tableau, Power BI, Looker, and QlikView. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "8": {
    "correct": "<strong>A)</strong> <strong>Optimize the dashboard.</strong> is the correct answer. <br><strong>What it is:</strong> Optimize the dashboard. is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. <br><strong>Why correct here:</strong> Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights.",
    "wrong": "<strong>B)</strong> <em>Create subscriptions.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Get stakeholder approval.</em> — This is any person or group with an interest in a project's outcomes. In data projects: business users, IT, executives, regulators, and data consumers. It does not answer this question correctly.<br><strong>D)</strong> <em>Deploy to production.</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "9": {
    "correct": "<strong>C)</strong> <strong>Logical</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>A)</strong> <em>Date</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Mathematical</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Aggregate</em> — This is a function that performs a calculation on a set of values and returns a single value. Examples: COUNT, SUM, AVG, MIN, MAX. Used with GROUP BY to calculate metrics per group. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "10": {
    "correct": "<strong>D)</strong> <strong>Relational database</strong> is the correct answer. <br><strong>What it is:</strong> Relational database is a database that organizes data into tables (relations) with rows and columns, linked by keys. <br><strong>Why correct here:</strong> Uses SQL for querying. Examples: MySQL, PostgreSQL, SQL Server, Oracle.",
    "wrong": "<strong>A)</strong> <em>Key-value pairs</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Online transactional processing</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data lake</em> — This is a storage repository that holds vast amounts of raw data in its native format until needed. Supports structured, semi-structured, and unstructured data. More flexible but requires strong governance to avoid becoming a 'data swamp'. It does not answer this question correctly.",
    "domain": "Databases & Data Concepts"
  },
  "11": {
    "correct": "<strong>D)</strong> <strong>Cluster</strong> (cluster analysis / segmentation) is the correct answer. <br><strong>Why correct here:</strong> Grouping customers by recency, frequency, and monetary value (RFM-style inputs) is a classic <strong>clustering / segmentation</strong> task: you partition customers into segments for targeting—not prescriptive optimization, a simple trend line, or a “gap” analysis.",
    "wrong": "<strong>A)</strong> <em>Prescriptive</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Trend</em> — This is the long-term direction (increasing, decreasing, or flat) in a time series. Identified by removing seasonality and noise from the data. It does not answer this question correctly.<br><strong>C)</strong> <em>Gap</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "12": {
    "correct": "<strong>A)</strong> <strong>Display the version number next to each submission on the dashboard.</strong> is the correct answer. <br><strong>What it is:</strong> Display the version number next to each submission on the dashboard. is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. <br><strong>Why correct here:</strong> Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights.",
    "wrong": "<strong>B)</strong> <em>Present a data refresh date at the top of the dashboard.</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.<br><strong>C)</strong> <em>Confirm the dashboard is adhering to the corporate style guide.</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.<br><strong>D)</strong> <em>Use permissions to ensure users only see certain versions of the submissions.</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "13": {
    "correct": "<strong>D)</strong> <strong>discrete data.</strong> is the correct answer. <br><strong>What it is:</strong> discrete data. is data that can only take specific, countable values (e.g., number of customers, number of defects). <br><strong>Why correct here:</strong> Cannot be meaningfully subdivided — you cannot have 2.5 customers.",
    "wrong": "<strong>A)</strong> <em>continuous data.</em> — This is data that can take any value within a range (e.g., temperature, height, weight). Can be measured with arbitrary precision. Contrast with discrete data, which has countable values. It does not answer this question correctly.<br><strong>B)</strong> <em>categorical data.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>ordinal data.</em> — This is categorical data with a meaningful order but no consistent interval between values (e.g., satisfaction ratings: poor/fair/good). You can rank ordinal data but cannot calculate meaningful averages. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  },
  "14": {
    "correct": "<strong>A)</strong> <strong>Static</strong> is the correct answer. <br><strong>Concept:</strong> a virtual table defined by a SQL query, stored as an object in the database. <br><strong>Why correct here:</strong> Does not store data itself; reflects the current data in the underlying tables when queried.",
    "wrong": "<strong>B)</strong> <em>Real-time</em> — This is processing and analyzing data as it is generated, with minimal delay. Used for fraud detection, live dashboards, and IoT sensor monitoring. It does not answer this question correctly.<br><strong>C)</strong> <em>Self-service</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Dynamic</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "15": {
    "correct": "<strong>A)</strong> <strong>Cell phone device name</strong> is the correct answer. <br><strong>Concept:</strong> PII (Personally Identifiable Information). <br><strong>Why correct here:</strong> Any data that can be used to identify a specific individual; protected by privacy laws.",
    "wrong": "<strong>B)</strong> <em>Customer’s name</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Government ID number</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Telephone number</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "16": {
    "correct": "<strong>B)</strong> <strong>String</strong> is the correct answer. <br><strong>What it is:</strong> String is a sequence of characters used to represent text. <br><strong>Why correct here:</strong> Stored in quotes; operations include concatenation, substring, length, and pattern matching.",
    "wrong": "<strong>A)</strong> <em>Boolean</em> — This is a data type with only two possible values: true or false (or 1/0). Used in logic, filters, and conditional operations. It does not answer this question correctly.<br><strong>C)</strong> <em>Integer</em> — This is a whole number with no decimal component. Used for counts and discrete quantities. Operations include arithmetic. It does not answer this question correctly.<br><strong>D)</strong> <em>Float</em> — This is a number with a decimal component (floating-point number). Used for measurements and calculations requiring precision beyond whole numbers. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  },
  "17": {
    "correct": "<strong>D)</strong> <strong>Perform exploratory data analysis.</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>Rephrase the business requirement.</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Determine the data necessary for the analysis.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Build a mock dashboard/presentation layout.</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "18": {
    "correct": "<strong>D)</strong> <strong>Python</strong> is the correct answer for this question about <em>Analytics Tools</em>.",
    "wrong": "<strong>A)</strong> <em>SAS</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Microsoft Power BI</em> — This is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. Tools include Tableau, Power BI, Looker, and QlikView. It does not answer this question correctly.<br><strong>C)</strong> <em>IBM SPSS</em> — This is not the best answer for this scenario.",
    "domain": "Analytics Tools"
  },
  "19": {
    "correct": "<strong>D)</strong> <strong>A summary with statistics, conclusions, and recommendations from the data analyst</strong> is the correct answer. <br><strong>Concept:</strong> Key Performance Indicator — a measurable value that demonstrates how effectively a company is achieving key business objectives. <br><strong>Why correct here:</strong> Examples: monthly revenue, customer churn rate, Net Promoter Score. Good KPIs are SMART: Specific, Measurable, Achievable, Relevant, Time-bound.",
    "wrong": "<strong>A)</strong> <em>A real-time monitor that allows the manager to view performance the day the campaign was launched</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.<br><strong>B)</strong> <em>A self-service dashboard that allows the manager to look at the company’s annual budget performance</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.<br><strong>C)</strong> <em>A spreadsheet of the raw data from all marketing campaigns and channels</em> — This is a measure of variability/spread. Quantifies how much data values differ from each other or from the mean. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "20": {
    "correct": "<strong>D)</strong> <strong>Delimit</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>A)</strong> <em>Append</em> — This is adding new rows (records) to an existing dataset. Differs from joining, which adds new columns. Used when combining data from the same source over different time periods. It does not answer this question correctly.<br><strong>B)</strong> <em>Merge</em> — This is combining two or more datasets based on a common key or identifier. Equivalent to a SQL JOIN. Matches records from different datasets using a shared field. It does not answer this question correctly.<br><strong>C)</strong> <em>Concatenate</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "21": {
    "correct": "<strong>C)</strong> <strong>In general, users who visit the new website are more likely to make a purchase.</strong> is the correct answer. <br><strong>Concept:</strong> a range of values that likely contains the true population parameter with a given level of confidence (e.g., 95%). <br><strong>Why correct here:</strong> A 95% CI means that if you repeated the study 100 times, ~95 of the intervals would contain the true value.",
    "wrong": "<strong>A)</strong> <em>In Germany, the increase in conversion from the new layout was not significant.</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>In France, the increase in conversion from the new layout was not significant.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>The new layout has the lowest conversion rates in the United Kingdom.</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "22": {
    "correct": "<strong>B)</strong> <strong>Pie</strong> is the correct answer. <br><strong>Concept:</strong> a data collection method that gathers information from respondents through questions. <br><strong>Why correct here:</strong> Provides primary data directly from the source. Can be structured (fixed questions) or unstructured (open-ended).",
    "wrong": "<strong>A)</strong> <em>Histogram</em> — This is a chart that shows the frequency distribution of a continuous variable by dividing it into bins. Unlike bar charts, bins are contiguous. The shape reveals whether data is normally distributed, skewed, or bimodal. It does not answer this question correctly.<br><strong>C)</strong> <em>Line</em> — This is a model that fits a straight line to data to predict a continuous dependent variable from one or more independent variables. Minimizes the sum of squared residuals (errors) to find the best-fit line. It does not answer this question correctly.<br><strong>D)</strong> <em>Scatter pot</em> — This is not the best answer for this scenario.<br><strong>E)</strong> <em>Waterfall</em> — This is a linear, sequential project management approach where each phase must be completed before the next begins. Phases: requirements → design → development → testing → deployment → maintenance. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "23": {
    "correct": "<strong>A)</strong> <code>374mm</code> is the correct calculated answer. <br><em>Formula reminder:</em> Mean = Sum of all values ÷ Number of values",
    "wrong": "<strong>B)</strong> <em>405mm</em> — incorrect calculation result. <strong>C)</strong> <em>493mm</em> — incorrect calculation result. <strong>D)</strong> <em>504mm</em> — incorrect calculation result.",
    "domain": "Data Analysis & Statistics"
  },
  "24": {
    "correct": "<strong>A)</strong> <strong>To improve data acquisition</strong> is the correct answer. <br><strong>Concept:</strong> a repository that defines the meaning, format, and usage of data elements within a system. <br><strong>Why correct here:</strong> Helps ensure consistent understanding and use of data across teams.",
    "wrong": "<strong>B)</strong> <em>To remember specifics about data fields</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>To specify user groups for databases</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>To provide continuity through personnel turnover</em> — This is not the best answer for this scenario.<br><strong>E)</strong> <em>To confine breaches of PHI data</em> — This is not the best answer for this scenario.<br><strong>F)</strong> <em>To reduce processing power requirements</em> — This is not the best answer for this scenario.",
    "domain": "Data Governance & Quality"
  },
  "25": {
    "correct": "<strong>C)</strong> <strong>The databases are recording the event in different time zones.</strong> is the correct answer for this question about <em>Data Governance & Quality</em>.",
    "wrong": "<strong>A)</strong> <em>The data analyst is not querying the databases correctly.</em> — This is a request to retrieve or manipulate data in a database. In SQL, a SELECT query specifies what data to retrieve and from where. It does not answer this question correctly.<br><strong>B)</strong> <em>The databases are recording different events.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>The second database is logging incorrectly.</em> — This is not the best answer for this scenario.",
    "domain": "Data Governance & Quality"
  },
  "26": {
    "correct": "<strong>D)</strong> <strong>JPEG file</strong> is the correct answer for this question about <em>Data Types & Structures</em>.",
    "wrong": "<strong>A)</strong> <em>CSV file</em> — This is Comma-Separated Values — a plain text format for storing tabular data with each row on a new line and columns separated by commas. Simple, widely supported, but lacks support for data types and complex structures. It does not answer this question correctly.<br><strong>B)</strong> <em>PDF file</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>JSON file</em> — This is JavaScript Object Notation — a lightweight, human-readable data format used for transmitting data between a server and web application. Uses key-value pairs and arrays. Widely used in REST APIs and NoSQL databases. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  },
  "27": {
    "correct": "<strong>B)</strong> <strong>Strategy 4 provides the best sales in comparison to other strategies.</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>Sales are approximately equal for Product A and Product B across all strategies.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>While Strategy 2 does not result in the highest sales of Product D, over all products it appears to be the most effective.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Product D should be promoted more than the other products in all strategies.</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "28": {
    "correct": "<strong>A)</strong> <strong>Web scraping</strong> is the correct answer. <br><strong>What it is:</strong> Web scraping is Application Programming Interface — a set of rules and protocols that allows different software applications to communicate with each other. <br><strong>Why correct here:</strong> REST APIs use HTTP requests to GET, POST, PUT, and DELETE data in JSON or XML format.",
    "wrong": "<strong>B)</strong> <em>Sampling</em> — This is selecting a subset of a population to estimate characteristics of the whole. Methods: random, stratified, cluster, systematic, and convenience sampling. It does not answer this question correctly.<br><strong>C)</strong> <em>Data wrangling</em> — This is the process of transforming and mapping raw data into a format suitable for analysis. Also called data munging. Includes cleaning, restructuring, and enriching data. It does not answer this question correctly.<br><strong>D)</strong> <em>ETL</em> — This is Extract, Transform, Load — a data integration process that extracts data from sources, transforms it into the required format, and loads it into a target system. The standard pipeline for populating data warehouses. Transformation includes cleaning, deduplication, and enrichment. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "29": {
    "correct": "<strong>C)</strong> <code>0,600</code> is the correct calculated answer. <br><em>Formula reminder:</em> Apply the relevant formula step-by-step, then verify units match the answer choices.",
    "wrong": "<strong>A)</strong> <em>7,038</em> — incorrect calculation result. <strong>B)</strong> <em>9,600</em> — incorrect calculation result. <strong>D)</strong> <em>0,800</em> — incorrect calculation result.",
    "domain": "Visualization & Reporting"
  },
  "30": {
    "correct": "<strong>B)</strong> <strong>Heat map</strong> is the correct answer. <br><strong>What it is:</strong> Heat map is a visualization that uses color intensity to represent the value of a variable across a two-dimensional space. <br><strong>Why correct here:</strong> Used to show patterns, correlations, or geographic distributions.",
    "wrong": "<strong>A)</strong> <em>Scatter plot</em> — This is a chart that uses dots to show the relationship between two continuous variables. Used to identify correlation, clusters, and outliers. The x-axis is typically the independent variable. It does not answer this question correctly.<br><strong>C)</strong> <em>Pie chart</em> — This is a circular chart divided into slices to show the proportion of each category as a percentage of the whole. Best limited to 5-6 categories. Difficult to compare similarly-sized slices — bar charts are often clearer. It does not answer this question correctly.<br><strong>D)</strong> <em>Infographic</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "31": {
    "correct": "<strong>B)</strong> <strong>Logical</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>Aggregate</em> — This is a function that performs a calculation on a set of values and returns a single value. Examples: COUNT, SUM, AVG, MIN, MAX. Used with GROUP BY to calculate metrics per group. It does not answer this question correctly.<br><strong>C)</strong> <em>Date</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Sort</em> — This is arranging data in ascending or descending order based on one or more columns. Fundamental data operation for ranking, display, and identifying extremes. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "32": {
    "correct": "<strong>C)</strong> <strong>Filter on any of the responses that do not say “January” and update them to “January”.</strong> is the correct answer. <br><strong>Concept:</strong> a virtual table defined by a SQL query, stored as an object in the database. <br><strong>Why correct here:</strong> Does not store data itself; reflects the current data in the underlying tables when queried.",
    "wrong": "<strong>A)</strong> <em>Delete any of the responses that do not have “January” written out.</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Replace any of the responses that have “01”.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Sort any of the responses that say “Jan” and update them to “01”.</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "33": {
    "correct": "<strong>B)</strong> <strong>Duplicate data</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>A)</strong> <em>Missing data</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Redundant data</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Invalid data</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "34": {
    "correct": "<strong>D)</strong> <strong>Surveys sent to 100 randomly selected homes that are reflective of the population</strong> is the correct answer. <br><strong>What it is:</strong> Surveys sent to 100 randomly selected homes that are reflective of the population is the complete set of all individuals or items of interest in a study. <br><strong>Why correct here:</strong> Parameters (true values) describe populations; statistics describe samples.",
    "wrong": "<strong>A)</strong> <em>A stratified phone survey of 100 people that is conducted between 2:00 p.m. and 3:00 p.m.</em> — This is Common Table Expression — a named temporary result set defined with the WITH clause, used within a single SQL query. Improves readability and allows recursive queries. It does not answer this question correctly.<br><strong>B)</strong> <em>A systematic survey that is sent to 100 single-family homes in the county</em> — This is a data collection method that gathers information from respondents through questions. Provides primary data directly from the source. Can be structured (fixed questions) or unstructured (open-ended). It does not answer this question correctly.<br><strong>C)</strong> <em>Surveys sent to ten randomly selected homes within 5mi (8km) of the county’s office</em> — This is Common Table Expression — a named temporary result set defined with the WITH clause, used within a single SQL query. Improves readability and allows recursive queries. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "35": {
    "correct": "<strong>B)</strong> <strong>Chi-squared test</strong> is the correct answer. <br><strong>What it is:</strong> Chi-squared test is a statistical test used to determine if there is a significant association between two categorical variables. <br><strong>Why correct here:</strong> Compares observed frequencies to expected frequencies under the null hypothesis.",
    "wrong": "<strong>A)</strong> <em>Simple linear regression</em> — This is a statistical technique that models the relationship between a dependent variable and one or more independent variables. Linear regression fits a straight line; used for prediction. The output is a formula like y = mx + b. It does not answer this question correctly.<br><strong>C)</strong> <em>Z-test</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Two-sample t-test</em> — This is a subset of a population selected to represent the whole. Sampling allows inference about a population without measuring every individual. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "36": {
    "correct": "<strong>D)</strong> <strong>IF</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>A)</strong> <em>WHERE</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>AGGREGATE</em> — This is a function that performs a calculation on a set of values and returns a single value. Examples: COUNT, SUM, AVG, MIN, MAX. Used with GROUP BY to calculate metrics per group. It does not answer this question correctly.<br><strong>C)</strong> <em>BOOLEAN</em> — This is a data type with only two possible values: true or false (or 1/0). Used in logic, filters, and conditional operations. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "37": {
    "correct": "<strong>D)</strong> <strong>Create a dashboard with views for team, individuals, and management. Configure permissions to control access.</strong> is the correct answer. <br><strong>Why correct here:</strong> The sales team needs <em>everyone</em> to see pipeline and team performance, while commission detail must stay confidential. Separate <strong>views</strong> for team, individual, and management plus <strong>role-based permissions</strong> let you show the right metrics to each audience (e.g., hide or aggregate sensitive commission data for roles that should not see it).",
    "wrong": "<strong>A)</strong> <em>Refresh date + permissions</em> — A refresh date helps trust in data currency but does not, by itself, define distinct audiences for confidential commission data the way dedicated views do.<br><strong>B)</strong> <em>Dashboard only for the management team</em> — The scenario asks for visibility for the <em>sales team</em> broadly, not only managers; this option excludes the wider team.<br><strong>C)</strong> <em>Filters only</em> — Self-service filters do not enforce confidentiality; users could still open slices that expose commission data unless access is governed by permissions and curated views.",
    "domain": "Visualization & Reporting"
  },
  "38": {
    "correct": "<strong>C)</strong> <strong>It is structured in nature.</strong> is the correct answer. <br><strong>Concept:</strong> a database that organizes data into tables (relations) with rows and columns, linked by keys. <br><strong>Why correct here:</strong> Uses SQL for querying. Examples: MySQL, PostgreSQL, SQL Server, Oracle.",
    "wrong": "<strong>A)</strong> <em>It utilizes key-value pairs.</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>It has undefined fields.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>It uses minimal memory.</em> — This is not the best answer for this scenario.",
    "domain": "Databases & Data Concepts"
  },
  "39": {
    "correct": "<strong>C)</strong> <strong>January, 2020 to April 8, 2020</strong> is the correct answer. <br><strong>Concept:</strong> the difference between the maximum and minimum values in a dataset. <br><strong>Why correct here:</strong> A simple but outlier-sensitive measure of spread.",
    "wrong": "<strong>A)</strong> <em>January, 2020 to April, 2020</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>January, 2020 to April 7, 2020</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>January, 2020 to April 9, 2020</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "40": {
    "correct": "<strong>C)</strong> <strong>Standardization of data field names</strong> is the correct answer. <br><strong>Concept:</strong> Master Data Management — the creation and maintenance of a single authoritative source of key business entities. <br><strong>Why correct here:</strong> Ensures consistency of critical data like customer, product, and vendor records across systems.",
    "wrong": "<strong>A)</strong> <em>Creation of a data dictionary</em> — This is a repository that defines the meaning, format, and usage of data elements within a system. Helps ensure consistent understanding and use of data across teams. It does not answer this question correctly.<br><strong>B)</strong> <em>Compliance with regulations</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Consolidation of multiple data fields</em> — This is not the best answer for this scenario.",
    "domain": "Data Governance & Quality"
  },
  "41": {
    "correct": "<strong>C)</strong> <strong>Microsoft Excel</strong> is the correct answer. <br><strong>Concept:</strong> a data summarization tool that dynamically reorganizes and aggregates data by selected dimensions and measures. <br><strong>Why correct here:</strong> Allows users to rotate rows and columns to explore data from different angles.",
    "wrong": "<strong>A)</strong> <em>IBM SPSS</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>SAS</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Domo</em> — This is not the best answer for this scenario.",
    "domain": "Analytics Tools"
  },
  "42": {
    "correct": "<strong>A)</strong> <strong>A control group for the phrases</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>B)</strong> <em>A summary of the KPIs</em> — This is Key Performance Indicator — a measurable value that demonstrates how effectively a company is achieving key business objectives. Examples: monthly revenue, customer churn rate, Net Promoter Score. Good KPIs are SMART: Specific, Measurable, Achievable, Relevant, Time-bound. It does not answer this question correctly.<br><strong>C)</strong> <em>Filter buttons for the status</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>The date when the report was last accessed</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>E)</strong> <em>The time period the report covers</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>F)</strong> <em>The date on which the report was run</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "43": {
    "correct": "<strong>A)</strong> <strong>Retention</strong> is the correct answer. <br><strong>What it is:</strong> Retention is the policies that define how long data should be stored before it is deleted or archived. <br><strong>Why correct here:</strong> Balances storage costs against regulatory requirements and business needs.",
    "wrong": "<strong>B)</strong> <em>Integrity</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Transmission</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Consistency</em> — This is not the best answer for this scenario.<br><strong>E)</strong> <em>Encryption</em> — This is the process of converting data into an unreadable format using an algorithm and a key, so only authorized parties can read it. At rest: encrypts stored data. In transit: encrypts data being transmitted (e.g., TLS/SSL). It does not answer this question correctly.<br><strong>F)</strong> <em>Deletion</em> — This is not the best answer for this scenario.",
    "domain": "Data Governance & Quality"
  },
  "44": {
    "correct": "<strong>C)</strong> <strong>Link analysis</strong> is the correct answer. <br><strong>Concept:</strong> Common Table Expression — a named temporary result set defined with the WITH clause, used within a single SQL query. <br><strong>Why correct here:</strong> Improves readability and allows recursive queries.",
    "wrong": "<strong>A)</strong> <em>Trend analysis</em> — This is the long-term direction (increasing, decreasing, or flat) in a time series. Identified by removing seasonality and noise from the data. It does not answer this question correctly.<br><strong>B)</strong> <em>Performance analysis</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Exploratory analysis</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "45": {
    "correct": "<strong>D)</strong> <strong>First Name</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>A)</strong> <em>First_Name_</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>FirstName</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>First_Name</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "46": {
    "correct": "<strong>C)</strong> <strong>Systematic</strong> is the correct answer. <br><strong>Concept:</strong> the complete set of all individuals or items of interest in a study. <br><strong>Why correct here:</strong> Parameters (true values) describe populations; statistics describe samples.",
    "wrong": "<strong>A)</strong> <em>Simple random</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Cluster</em> — This is an unsupervised machine learning technique that groups similar data points together based on their features. K-means assigns points to K clusters by minimizing distance to cluster centroids. It does not answer this question correctly.<br><strong>D)</strong> <em>Stratified</em> — This is dividing a population into subgroups (strata) and sampling from each proportionally. Ensures representation of all subgroups, especially minority groups. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "47": {
    "correct": "<strong>B)</strong> <strong>Seven rows, eight columns</strong> is the correct answer. <br><strong>What it is:</strong> Seven rows, eight columns is tabular/structured data. <br><strong>Why correct here:</strong> Data organized into rows and columns — the foundation of relational databases.",
    "wrong": "<strong>A)</strong> <em>Five rows, eight columns</em> — This is tabular/structured data. Data organized into rows and columns — the foundation of relational databases. It does not answer this question correctly.<br><strong>C)</strong> <em>Eight rows, seven columns</em> — This is tabular/structured data. Data organized into rows and columns — the foundation of relational databases. It does not answer this question correctly.<br><strong>D)</strong> <em>Nine rows, five columns</em> — This is tabular/structured data. Data organized into rows and columns — the foundation of relational databases. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "48": {
    "correct": "<strong>D)</strong> <code>$702,500</code> is the correct calculated answer. <br><em>Formula reminder:</em> Mean = Sum of all values ÷ Number of values",
    "wrong": "<strong>A)</strong> <em>$640,900</em> — incorrect calculation result. <strong>B)</strong> <em>$690,000</em> — incorrect calculation result. <strong>C)</strong> <em>$705,200</em> — incorrect calculation result.",
    "domain": "General Data Concepts"
  },
  "49": {
    "correct": "<strong>D)</strong> <strong>Data encryption</strong> is the correct answer. <br><strong>What it is:</strong> Data encryption is the process of converting data into an unreadable format using an algorithm and a key, so only authorized parties can read it. <br><strong>Why correct here:</strong> At rest: encrypts stored data. In transit: encrypts data being transmitted (e.g., TLS/SSL).",
    "wrong": "<strong>A)</strong> <em>Data transmission</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Data attribution</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data retention</em> — This is the policies that define how long data should be stored before it is deleted or archived. Balances storage costs against regulatory requirements and business needs. It does not answer this question correctly.",
    "domain": "Data Governance & Quality"
  },
  "50": {
    "correct": "<strong>B)</strong> <strong>Build calculations into the report so they are done automatically.</strong> is the correct answer. <br><strong>What it is:</strong> Build calculations into the report so they are done automatically. is a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>Create multiple reports, one for each needed date range.</em> — This is the difference between the maximum and minimum values in a dataset. A simple but outlier-sensitive measure of spread. It does not answer this question correctly.<br><strong>C)</strong> <em>Add macros to the report to speed up the filtering and calculations process.</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>D)</strong> <em>Create a dashboard with a date range picker and calculations built in.</em> — This is the difference between the maximum and minimum values in a dataset. A simple but outlier-sensitive measure of spread. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "51": {
    "correct": "<strong>D)</strong> <strong>redundant data</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>A)</strong> <em>dependent data.</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>duplicate data.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>invalid data</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "52": {
    "correct": "<strong>C)</strong> <strong>Replace redundant data.</strong> matches the published answer key for this item. <br><strong>Study angle:</strong> When an entire column is blank across responses, treat it as a systematic data-quality issue: the field may be redundant with another question, mis-mapped in the survey tool, or filled with placeholder duplicates. Cleaning redundant or repeated empty structures is consistent with exam-style “fix the collection/schema” framing rather than only row-level fixes.",
    "wrong": "<strong>A)</strong> <em>Replace missing data.</em> — Imputation or fill strategies address missing values row-by-row; when <em>every</em> respondent skipped the same item, the root cause is often survey design or export mapping, not isolated nulls.<br><strong>B)</strong> <em>Remove duplicate data.</em> — Deduplication fixes repeated records; it does not explain a column that is empty for all rows.<br><strong>D)</strong> <em>Remove invalid data.</em> — Removing invalid entries does not fix a systematic absence across the whole column.",
    "domain": "Data Mining & Manipulation"
  },
  "53": {
    "correct": "<strong>C)</strong> <strong>A measure of the amount of dispersion of a set of values</strong> is the correct answer. <br><strong>What it is:</strong> A measure of the amount of dispersion of a set of values is a measure of variability/spread. <br><strong>Why correct here:</strong> Quantifies how much data values differ from each other or from the mean.",
    "wrong": "<strong>A)</strong> <em>A measure that is used to establish a relationship between two variables</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>A measure of how data is distributed</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>A measure that is used to find the significant difference between variables</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "54": {
    "correct": "<strong>B)</strong> <strong>A scatter plot</strong> is the correct answer. <br><strong>What it is:</strong> A scatter plot is a chart that uses dots to show the relationship between two continuous variables. <br><strong>Why correct here:</strong> Used to identify correlation, clusters, and outliers. The x-axis is typically the independent variable.",
    "wrong": "<strong>A)</strong> <em>A histogram</em> — This is a chart that shows the frequency distribution of a continuous variable by dividing it into bins. Unlike bar charts, bins are contiguous. The shape reveals whether data is normally distributed, skewed, or bimodal. It does not answer this question correctly.<br><strong>C)</strong> <em>A heat map</em> — This is a visualization that uses color intensity to represent the value of a variable across a two-dimensional space. Used to show patterns, correlations, or geographic distributions. It does not answer this question correctly.<br><strong>D)</strong> <em>A bar chart</em> — This is a chart using rectangular bars to compare values across different categories. Horizontal bars are useful for long category labels. Vertical bars (column charts) emphasize change over time. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "55": {
    "correct": "<strong>B)</strong> <strong>Date</strong> is the correct answer for this question about <em>Data Types & Structures</em>.",
    "wrong": "<strong>A)</strong> <em>Numeric</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Alphanumeric</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Text</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "56": {
    "correct": "<strong>D)</strong> <strong>The data is outliers.</strong> is the correct answer. <br><strong>What it is:</strong> The data is outliers. is a data point that is significantly different from the rest of the dataset. <br><strong>Why correct here:</strong> Can distort the mean and standard deviation. Often handled by removing, capping, or transforming the value.",
    "wrong": "<strong>A)</strong> <em>There is data bias.</em> — This is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. Tools include Tableau, Power BI, Looker, and QlikView. It does not answer this question correctly.<br><strong>B)</strong> <em>The data is incomplete.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>The data is inconsistent.</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "57": {
    "correct": "<strong>B)</strong> <strong>The data refresh date</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>The date of the dashboard build</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.<br><strong>C)</strong> <em>A report summary</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>D)</strong> <em>Frequently asked questions</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "58": {
    "correct": "<strong>A)</strong> <strong>Median</strong> is the correct answer. <br><strong>What it is:</strong> Median is the middle value when data is sorted in order; the 50th percentile. <br><strong>Why correct here:</strong> Preferred over the mean when data is skewed or has outliers, because it is not affected by extreme values.",
    "wrong": "<strong>B)</strong> <em>Mean</em> — This is the arithmetic average of a dataset — sum of all values divided by the count. Used to measure central tendency when data is roughly symmetric and has no extreme outliers. It does not answer this question correctly.<br><strong>C)</strong> <em>Mode</em> — This is the value that appears most frequently in a dataset. Useful for categorical data or when you want to know the most common occurrence. It does not answer this question correctly.<br><strong>D)</strong> <em>Standard deviation</em> — This is the square root of the variance; measures the average distance of data points from the mean. The most widely used measure of spread. A low SD means data is clustered near the mean; a high SD means it is spread out. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "59": {
    "correct": "<strong>A)</strong> <strong>A data lake</strong> is the correct answer. <br><strong>What it is:</strong> A data lake is a storage repository that holds vast amounts of raw data in its native format until needed. <br><strong>Why correct here:</strong> Supports structured, semi-structured, and unstructured data. More flexible but requires strong governance to avoid becoming a 'data swamp'.",
    "wrong": "<strong>B)</strong> <em>A database management system</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>A database</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>A data warehouse</em> — This is a centralized repository designed for storing large volumes of historical, structured data for analytical reporting and business intelligence. Data is integrated from multiple sources and optimized for read-heavy analytical queries, not real-time transactions. It does not answer this question correctly.",
    "domain": "Databases & Data Concepts"
  },
  "60": {
    "correct": "<strong>A)</strong> <strong>Include a bar chart using the site and the percentage of new customers data.</strong> is the correct answer. <br><strong>What it is:</strong> Include a bar chart using the site and the percentage of new customers data. is a chart using rectangular bars to compare values across different categories. <br><strong>Why correct here:</strong> Horizontal bars are useful for long category labels. Vertical bars (column charts) emphasize change over time.",
    "wrong": "<strong>B)</strong> <em>Include a line chart using the site and the percentage of new customers data.</em> — This is a chart that displays data points connected by lines to show trends over time. Best for continuous data and time series. Multiple lines allow comparison of trends across groups. It does not answer this question correctly.<br><strong>C)</strong> <em>Include a pie chat using the site and percentage of new customers data.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Include a scatter chart using the site and the percent of new customers data.</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "61": {
    "correct": "<strong>D)</strong> <strong>Mean</strong> is the correct answer. <br><strong>What it is:</strong> Mean is the arithmetic average of a dataset — sum of all values divided by the count. <br><strong>Why correct here:</strong> Used to measure central tendency when data is roughly symmetric and has no extreme outliers.",
    "wrong": "<strong>A)</strong> <em>Frequency</em> — This is the count of how many times a value or category appears in a dataset. Relative frequency = count / total. Used in histograms and frequency tables. It does not answer this question correctly.<br><strong>B)</strong> <em>Percent change</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Variance</em> — This is the average of the squared differences from the mean; measures how spread out data is. Squaring removes negatives and amplifies large deviations, making it sensitive to outliers. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "62": {
    "correct": "<strong>C)</strong> <strong>an exploratory data analysis.</strong> is the correct answer. <br><strong>Concept:</strong> a data point that is significantly different from the rest of the dataset. <br><strong>Why correct here:</strong> Can distort the mean and standard deviation. Often handled by removing, capping, or transforming the value.",
    "wrong": "<strong>A)</strong> <em>a t-test.</em> — This is a statistical test that compares the means of one or two groups to determine if they differ significantly. Used when sample sizes are small or population standard deviation is unknown. It does not answer this question correctly.<br><strong>B)</strong> <em>a performance analysis.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>a link analysis.</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "63": {
    "correct": "<strong>A)</strong> <strong>Data accuracy</strong> is the correct answer. <br><strong>Concept:</strong> a data collection method that gathers information from respondents through questions. <br><strong>Why correct here:</strong> Provides primary data directly from the source. Can be structured (fixed questions) or unstructured (open-ended).",
    "wrong": "<strong>B)</strong> <em>Data constraints</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data attribute limitations</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Data bias</em> — This is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. Tools include Tableau, Power BI, Looker, and QlikView. It does not answer this question correctly.<br><strong>E)</strong> <em>Data consistency</em> — This is not the best answer for this scenario.<br><strong>F)</strong> <em>Data manipulation</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "64": {
    "correct": "<strong>D)</strong> <strong>Stratified</strong> is the correct answer. <br><strong>What it is:</strong> Stratified is dividing a population into subgroups (strata) and sampling from each proportionally. <br><strong>Why correct here:</strong> Ensures representation of all subgroups, especially minority groups.",
    "wrong": "<strong>A)</strong> <em>Systematic</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Simple random</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Convenience</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "65": {
    "correct": "<strong>C)</strong> <strong>Parsing</strong> is the correct answer. <br><strong>What it is:</strong> Parsing is the process of analyzing and converting data from one format into a structured format. <br><strong>Why correct here:</strong> Example: splitting a date string '2024-01-15' into year, month, and day fields.",
    "wrong": "<strong>A)</strong> <em>Imputing</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Transposing</em> — This is swapping the rows and columns of a dataset so rows become columns and vice versa. Useful for reshaping data for different analysis or display requirements. It does not answer this question correctly.<br><strong>D)</strong> <em>Concatenating</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "66": {
    "correct": "<strong>A)</strong> <strong>Mean</strong> is the correct answer. <br><strong>What it is:</strong> Mean is the arithmetic average of a dataset — sum of all values divided by the count. <br><strong>Why correct here:</strong> Used to measure central tendency when data is roughly symmetric and has no extreme outliers.",
    "wrong": "<strong>B)</strong> <em>Minimum</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Mode</em> — This is the value that appears most frequently in a dataset. Useful for categorical data or when you want to know the most common occurrence. It does not answer this question correctly.<br><strong>D)</strong> <em>Variance</em> — This is the average of the squared differences from the mean; measures how spread out data is. Squaring removes negatives and amplifies large deviations, making it sensitive to outliers. It does not answer this question correctly.<br><strong>E)</strong> <em>Correlation</em> — This is a statistical measure of how strongly two variables move together, ranging from -1 to +1. Positive correlation: both increase together. Negative: one increases as the other decreases. 0 = no linear relationship. It does not answer this question correctly.<br><strong>F)</strong> <em>Maximum</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "67": {
    "correct": "<strong>D)</strong> <strong>Flat files</strong> is the correct answer for this question about <em>Data Types & Structures</em>.",
    "wrong": "<strong>A)</strong> <em>Machine data</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Key-value pairs</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Delimited rows</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "68": {
    "correct": "<strong>A)</strong> <strong>transactional schema.</strong> is the correct answer. <br><strong>What it is:</strong> transactional schema. is the blueprint or structure of a database — defines tables, columns, data types, and relationships. <br><strong>Why correct here:</strong> A fixed schema (relational DB) enforces structure; a schema-less approach (NoSQL) allows flexible formats.",
    "wrong": "<strong>B)</strong> <em>star schema.</em> — This is the blueprint or structure of a database — defines tables, columns, data types, and relationships. A fixed schema (relational DB) enforces structure; a schema-less approach (NoSQL) allows flexible formats. It does not answer this question correctly.<br><strong>C)</strong> <em>non-relational schema.</em> — This is the blueprint or structure of a database — defines tables, columns, data types, and relationships. A fixed schema (relational DB) enforces structure; a schema-less approach (NoSQL) allows flexible formats. It does not answer this question correctly.<br><strong>D)</strong> <em>snowflake schema.</em> — This is the blueprint or structure of a database — defines tables, columns, data types, and relationships. A fixed schema (relational DB) enforces structure; a schema-less approach (NoSQL) allows flexible formats. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "69": {
    "correct": "<strong>B)</strong> <strong>Katie</strong> is the correct answer. <br><strong>Concept:</strong> the arithmetic average of a dataset — sum of all values divided by the count. <br><strong>Why correct here:</strong> Used to measure central tendency when data is roughly symmetric and has no extreme outliers.",
    "wrong": "<strong>A)</strong> <em>Randy</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Ralph</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Jean</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "70": {
    "correct": "<strong>B)</strong> <strong>CSV</strong> is the correct answer. <br><strong>What it is:</strong> CSV is Comma-Separated Values — a plain text format for storing tabular data with each row on a new line and columns separated by commas. <br><strong>Why correct here:</strong> Simple, widely supported, but lacks support for data types and complex structures.",
    "wrong": "<strong>A)</strong> <em>XLS</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>RTF</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>XML</em> — This is Extensible Markup Language — a text format that uses tags to define the structure of data. More verbose than JSON. Still widely used in legacy enterprise systems and configuration files. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  },
  "71": {
    "correct": "<strong>B)</strong> <strong>Provide individual links to recipients.</strong> is the correct answer. <br><strong>Concept:</strong> a virtual table defined by a SQL query, stored as an object in the database. <br><strong>Why correct here:</strong> Does not store data itself; reflects the current data in the underlying tables when queried.",
    "wrong": "<strong>A)</strong> <em>Publish it on the company intranet.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Grant subscription access.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Print individual dashboards.</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "72": {
    "correct": "<strong>B)</strong> <strong>YTD 2020 and YTD 2019</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>Q2 2020 and Q4 2019</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Q2 2020 and Q2 2019</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Q2 2020 and Q2 2021</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "73": {
    "correct": "<strong>C)</strong> <strong>Include a scatter chart using sales volume and average sales per customer.</strong> is the correct answer. <br><strong>What it is:</strong> Include a scatter chart using sales volume and average sales per customer. is the arithmetic mean — sum of all values divided by the count. <br><strong>Why correct here:</strong> The most common measure of central tendency for symmetric datasets.",
    "wrong": "<strong>A)</strong> <em>Include a line chart using the site and average sales per customer.</em> — This is the arithmetic mean — sum of all values divided by the count. The most common measure of central tendency for symmetric datasets. It does not answer this question correctly.<br><strong>B)</strong> <em>Include a pie chart using the site and sales to average sales per customer.</em> — This is the arithmetic mean — sum of all values divided by the count. The most common measure of central tendency for symmetric datasets. It does not answer this question correctly.<br><strong>D)</strong> <em>Include a column chart using the site and sales to average sales per customer.</em> — This is the arithmetic mean — sum of all values divided by the count. The most common measure of central tendency for symmetric datasets. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "74": {
    "correct": "<strong>A)</strong> <strong>Conduct an exploratory analysis and use descriptive statistics.</strong> is the correct answer for this question about <em>Data Analysis & Statistics</em>.",
    "wrong": "<strong>B)</strong> <em>Conduct a trend analysis and use a scatter chart.</em> — This is the long-term direction (increasing, decreasing, or flat) in a time series. Identified by removing seasonality and noise from the data. It does not answer this question correctly.<br><strong>C)</strong> <em>Conduct a link analysis and illustrate the connection points.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Conduct an initial analysis and use a Pareto chart.</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "75": {
    "correct": "<strong>C)</strong> <strong>November, 2019 to October 31, 2020</strong> is the correct answer. <br><strong>Concept:</strong> the arithmetic mean — sum of all values divided by the count. <br><strong>Why correct here:</strong> The most common measure of central tendency for symmetric datasets.",
    "wrong": "<strong>A)</strong> <em>October, 2019 to October 31, 2020</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>October 31, 2020 to November, 2021</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>October 31, 2019 to October 31, 2020</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "76": {
    "correct": "<strong>D)</strong> <strong>INNER:5 rows; LEFT: 9 rows</strong> is the correct answer. <br><strong>Concept:</strong> a SQL operation that combines rows from two or more tables based on a related column. <br><strong>Why correct here:</strong> Types: INNER (matching rows only), LEFT/RIGHT OUTER (all rows from one side), FULL OUTER (all rows from both sides), CROSS (all combinations).",
    "wrong": "<strong>A)</strong> <em>INNER: 6 rows; LEFT: 9 rows</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>INNER: 9 rows; LEFT: 6 rows</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>INNER: 9 rows; LEFT:5 rows</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "77": {
    "correct": "<strong>A)</strong> <strong>Use scheduled report delivery.</strong> is the correct answer. <br><strong>What it is:</strong> Use scheduled report delivery. is a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>B)</strong> <em>Implement subscription access delivery.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Print out a copy.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Upload the report to the server.</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "78": {
    "correct": "<strong>D)</strong> <strong>The number of people in an office</strong> is the correct answer. <br><strong>Concept:</strong> data that can only take specific, countable values (e.g., number of customers, number of defects). <br><strong>Why correct here:</strong> Cannot be meaningfully subdivided — you cannot have 2.5 customers.",
    "wrong": "<strong>A)</strong> <em>The temperature of a hot tub</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>The height of a horse</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>The time to complete a task</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "79": {
    "correct": "<strong>A)</strong> <strong>Numeric</strong> is the correct answer. <br><strong>Concept:</strong> a classification that specifies what kind of value a variable holds (e.g., integer, string, boolean, float). <br><strong>Why correct here:</strong> Determines what operations can be performed on the data and how much storage it requires.",
    "wrong": "<strong>B)</strong> <em>Date</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Float</em> — This is a number with a decimal component (floating-point number). Used for measurements and calculations requiring precision beyond whole numbers. It does not answer this question correctly.<br><strong>D)</strong> <em>Text</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "81": {
    "correct": "<strong>B)</strong> <strong>Determine the data needs and sources for analysis.</strong> is the correct answer. <br><strong>Concept:</strong> a virtual table defined by a SQL query, stored as an object in the database. <br><strong>Why correct here:</strong> Does not store data itself; reflects the current data in the underlying tables when queried.",
    "wrong": "<strong>A)</strong> <em>Determine the data needs and review the observations.</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.<br><strong>C)</strong> <em>Determine the data needs and schedule interviews.</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.<br><strong>D)</strong> <em>Determine the data needs and begin the analysis.</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "82": {
    "correct": "<strong>B)</strong> <strong>Ad hoc</strong> is the correct answer. <br><strong>What it is:</strong> Ad hoc is performed or created for a specific purpose on an as-needed basis, not planned in advance. <br><strong>Why correct here:</strong> Ad hoc queries are one-time SQL queries written to answer a specific question, unlike scheduled reports.",
    "wrong": "<strong>A)</strong> <em>Tactical</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Dynamic</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Recurring</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "83": {
    "correct": "<strong>B)</strong> <strong>R</strong> is the correct answer. <br><strong>Concept:</strong> the arithmetic average of a dataset — sum of all values divided by the count. <br><strong>Why correct here:</strong> Used to measure central tendency when data is roughly symmetric and has no extreme outliers.",
    "wrong": "<strong>A)</strong> <em>Microsoft Excel</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Snowflake</em> — This is a variation of the star schema where dimension tables are normalized into multiple related tables. Reduces data redundancy but requires more complex joins than a star schema. It does not answer this question correctly.<br><strong>D)</strong> <em>SQL</em> — This is Structured Query Language — the standard language for managing and querying relational databases. Core operations: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove), and DDL (define structure). It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "84": {
    "correct": "<strong>C)</strong> <strong>Survey</strong> is the correct answer. <br><strong>What it is:</strong> Survey is a data collection method that gathers information from respondents through questions. <br><strong>Why correct here:</strong> Provides primary data directly from the source. Can be structured (fixed questions) or unstructured (open-ended).",
    "wrong": "<strong>A)</strong> <em>Web scraping</em> — This is Application Programming Interface — a set of rules and protocols that allows different software applications to communicate with each other. REST APIs use HTTP requests to GET, POST, PUT, and DELETE data in JSON or XML format. It does not answer this question correctly.<br><strong>B)</strong> <em>Observation</em> — This is a data collection method where data is gathered by watching subjects in their natural environment. Minimizes the Hawthorne effect if subjects are unaware they are being observed. It does not answer this question correctly.<br><strong>D)</strong> <em>Sampling</em> — This is selecting a subset of a population to estimate characteristics of the whole. Methods: random, stratified, cluster, systematic, and convenience sampling. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "85": {
    "correct": "<strong>D)</strong> <strong>Correct the dates so they have the same format.</strong> is the correct answer. <br><strong>Concept:</strong> the long-term direction (increasing, decreasing, or flat) in a time series. <br><strong>Why correct here:</strong> Identified by removing seasonality and noise from the data.",
    "wrong": "<strong>A)</strong> <em>Fill in the missing cost where it is null.</em> — This is a special marker in SQL indicating that a value is missing, unknown, or not applicable. NULL is not the same as zero or an empty string. Use IS NULL / IS NOT NULL to test for it. It does not answer this question correctly.<br><strong>B)</strong> <em>Separate the table into two tables and create a primary key.</em> — This is a column (or combination of columns) in a table that uniquely identifies each row. Cannot contain NULL values and must be unique across all rows. It does not answer this question correctly.<br><strong>C)</strong> <em>Replace the extended cost field with a calculated field.</em> — This is a new field created by applying a formula or transformation to existing fields. Allows analysts to derive new metrics (e.g., profit margin = (revenue - cost) / revenue) without modifying source data. It does not answer this question correctly.",
    "domain": "General Data Concepts"
  },
  "86": {
    "correct": "<strong>B)</strong> <strong>There can be only one primary key in a data set, whereas there can be multiple unique keys.</strong> is the correct answer. <br><strong>What it is:</strong> There can be only one primary key in a data set, whereas there can be multiple unique keys. is a column (or combination of columns) in a table that uniquely identifies each row. <br><strong>Why correct here:</strong> Cannot contain NULL values and must be unique across all rows.",
    "wrong": "<strong>A)</strong> <em>A unique key cannot take null values, whereas a primary key can take null values.</em> — This is a column (or combination of columns) in a table that uniquely identifies each row. Cannot contain NULL values and must be unique across all rows. It does not answer this question correctly.<br><strong>C)</strong> <em>A primary key can take a value more than once, whereas a unique key cannot take a value more than once.</em> — This is a column (or combination of columns) in a table that uniquely identifies each row. Cannot contain NULL values and must be unique across all rows. It does not answer this question correctly.<br><strong>D)</strong> <em>A primary key cannot be a date variable, whereas a unique key can be.</em> — This is a column (or combination of columns) in a table that uniquely identifies each row. Cannot contain NULL values and must be unique across all rows. It does not answer this question correctly.",
    "domain": "General Data Concepts"
  },
  "87": {
    "correct": "<strong>B)</strong> <strong>Discrete data can only be a finite number of values.</strong> is the correct answer. <br><strong>What it is:</strong> Discrete data can only be a finite number of values. is data that can only take specific, countable values (e.g., number of customers, number of defects). <br><strong>Why correct here:</strong> Cannot be meaningfully subdivided — you cannot have 2.5 customers.",
    "wrong": "<strong>A)</strong> <em>Discrete data cannot create a sloped line.</em> — This is data that can only take specific, countable values (e.g., number of customers, number of defects). Cannot be meaningfully subdivided — you cannot have 2.5 customers. It does not answer this question correctly.<br><strong>C)</strong> <em>Discrete data can have decimal points.</em> — This is data that can only take specific, countable values (e.g., number of customers, number of defects). Cannot be meaningfully subdivided — you cannot have 2.5 customers. It does not answer this question correctly.<br><strong>D)</strong> <em>Discrete data applies only to numbers.</em> — This is data that can only take specific, countable values (e.g., number of customers, number of defects). Cannot be meaningfully subdivided — you cannot have 2.5 customers. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  },
  "88": {
    "correct": "<strong>A)</strong> <strong>CSV</strong> is the correct answer. <br><strong>What it is:</strong> CSV is Comma-Separated Values — a plain text format for storing tabular data with each row on a new line and columns separated by commas. <br><strong>Why correct here:</strong> Simple, widely supported, but lacks support for data types and complex structures.",
    "wrong": "<strong>B)</strong> <em>XLSM</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>XML</em> — This is Extensible Markup Language — a text format that uses tags to define the structure of data. More verbose than JSON. Still widely used in legacy enterprise systems and configuration files. It does not answer this question correctly.<br><strong>D)</strong> <em>JSON</em> — This is JavaScript Object Notation — a lightweight, human-readable data format used for transmitting data between a server and web application. Uses key-value pairs and arrays. Widely used in REST APIs and NoSQL databases. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "89": {
    "correct": "<strong>C)</strong> <strong>Regression</strong> is the correct answer. <br><strong>What it is:</strong> Regression is a statistical technique that models the relationship between a dependent variable and one or more independent variables. <br><strong>Why correct here:</strong> Linear regression fits a straight line; used for prediction. The output is a formula like y = mx + b.",
    "wrong": "<strong>A)</strong> <em>Chi-squared</em> — This is a statistical test used to determine if there is a significant association between two categorical variables. Compares observed frequencies to expected frequencies under the null hypothesis. It does not answer this question correctly.<br><strong>B)</strong> <em>Correlation</em> — This is a statistical measure of how strongly two variables move together, ranging from -1 to +1. Positive correlation: both increase together. Negative: one increases as the other decreases. 0 = no linear relationship. It does not answer this question correctly.<br><strong>D)</strong> <em>t-test</em> — This is a statistical test that compares the means of one or two groups to determine if they differ significantly. Used when sample sizes are small or population standard deviation is unknown. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "90": {
    "correct": "<strong>D)</strong> <strong>A stacked bar chart</strong> is the correct answer. <br><strong>What it is:</strong> A stacked bar chart is a chart using rectangular bars to compare values across different categories. <br><strong>Why correct here:</strong> Horizontal bars are useful for long category labels. Vertical bars (column charts) emphasize change over time.",
    "wrong": "<strong>A)</strong> <em>A line chart</em> — This is a chart that displays data points connected by lines to show trends over time. Best for continuous data and time series. Multiple lines allow comparison of trends across groups. It does not answer this question correctly.<br><strong>B)</strong> <em>A waterfall chart</em> — This is a chart that shows how an initial value is affected by a series of positive and negative changes, leading to a final value. Commonly used in financial analysis to show profit/loss breakdowns. It does not answer this question correctly.<br><strong>C)</strong> <em>A heat map</em> — This is a visualization that uses color intensity to represent the value of a variable across a two-dimensional space. Used to show patterns, correlations, or geographic distributions. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "91": {
    "correct": "<strong>D)</strong> <strong>continuous data.</strong> is the correct answer. <br><strong>What it is:</strong> continuous data. is data that can take any value within a range (e.g., temperature, height, weight). <br><strong>Why correct here:</strong> Can be measured with arbitrary precision. Contrast with discrete data, which has countable values.",
    "wrong": "<strong>A)</strong> <em>ordinal data.</em> — This is categorical data with a meaningful order but no consistent interval between values (e.g., satisfaction ratings: poor/fair/good). You can rank ordinal data but cannot calculate meaningful averages. It does not answer this question correctly.<br><strong>B)</strong> <em>nominal data.</em> — This is categorical data with no inherent order (e.g., colors, gender, country). Only equality/inequality can be assessed — no ranking or arithmetic is meaningful. It does not answer this question correctly.<br><strong>C)</strong> <em>boolean data.</em> — This is a data type with only two possible values: true or false (or 1/0). Used in logic, filters, and conditional operations. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  },
  "92": {
    "correct": "<strong>D)</strong> <strong>When p is 0.06</strong> is the correct answer. <br><strong>Concept:</strong> a testable statement about a population parameter. <br><strong>Why correct here:</strong> The null hypothesis (H0) assumes no effect; the alternative hypothesis (H1) assumes there is an effect.",
    "wrong": "<strong>A)</strong> <em>When p is 0.00003</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>When p is 0.001</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>When p is 0.04</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "93": {
    "correct": "<strong>C)</strong> <strong>Review the business questions to understand the scope.</strong> is the correct answer. <br><strong>What it is:</strong> Review the business questions to understand the scope. is a virtual table defined by a SQL query, stored as an object in the database. <br><strong>Why correct here:</strong> Does not store data itself; reflects the current data in the underlying tables when queried.",
    "wrong": "<strong>A)</strong> <em>Determine the data needs and sources for analysis.</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Initiate the analysis for exploratory data analysis.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Finalize the methodology to solve the problem.</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "94": {
    "correct": "<strong>D) BusinessObjects</strong> and <strong>E) Stata</strong> are the correct answers. <br><strong>What they are:</strong> BusinessObjects is a business intelligence and reporting platform, and Stata is a statistical analysis package with strong data visualization capabilities. <br><strong>Why correct here:</strong> Both tools are used to analyze data and create advanced statistical visualizations.",
    "wrong": "<strong>A)</strong> <em>SQL</em> — This is primarily a language for querying and managing relational databases, not for creating advanced statistical visualizations.<br><strong>B)</strong> <em>Domo</em> — This is mainly a dashboard and business reporting platform rather than a specialized tool for advanced statistical visualizations.<br><strong>C)</strong> <em>Rapid mining</em> — This is primarily used for data mining and machine learning workflows, not as a primary tool for advanced statistical visualizations in this context.<br><strong>F)</strong> <em>Apex</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "95": {
    "correct": "<strong>D)</strong> <strong>Optimize the dashboard.</strong> is the correct answer. <br><strong>What it is:</strong> Optimize the dashboard. is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. <br><strong>Why correct here:</strong> Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights.",
    "wrong": "<strong>A)</strong> <em>Deploy the dashboard to production.</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.<br><strong>B)</strong> <em>Change the field definitions.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Update the dashboard subscribers.</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "96": {
    "correct": "<strong>B)</strong> <strong>Data completeness</strong> is the correct answer. <br><strong>Concept:</strong> a subset of a population selected to represent the whole. <br><strong>Why correct here:</strong> Sampling allows inference about a population without measuring every individual.",
    "wrong": "<strong>A)</strong> <em>Data accuracy</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data duplication</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Data integrity</em> — This is not the best answer for this scenario.",
    "domain": "Databases & Data Concepts"
  },
  "97": {
    "correct": "<strong>B)</strong> <strong>Consumer types</strong> is the correct answer. <br><strong>Concept:</strong> a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. <br><strong>Why correct here:</strong> Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights.",
    "wrong": "<strong>A)</strong> <em>Data refresh rate</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Access permissions</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Data sources and attributes</em> — This is any system, file, or location from which data is collected. Can be internal (CRM, ERP, databases) or external (APIs, web, government data). It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "98": {
    "correct": "<strong>C)</strong> <strong>2019 goal data</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>2018 goal data</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>2018 actual revenue</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>2019 commission plan</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "99": {
    "correct": "<strong>C)</strong> <strong>There is a difference in a dancer’s flexibility between static and dynamic stretching.</strong> is the correct answer. <br><strong>What it is:</strong> There is a difference in a dancer’s flexibility between static and dynamic stretching. is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. <br><strong>Why correct here:</strong> Tools include Tableau, Power BI, Looker, and QlikView.",
    "wrong": "<strong>A)</strong> <em>A dancer’s flexibility is improved through static stretching.</em> — This is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. Tools include Tableau, Power BI, Looker, and QlikView. It does not answer this question correctly.<br><strong>B)</strong> <em>The change in a dancer’s flexibility is not equal to zero.</em> — This is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. Tools include Tableau, Power BI, Looker, and QlikView. It does not answer this question correctly.<br><strong>D)</strong> <em>The means of the static and dynamic stretching groups do not differ from each other.</em> — This is the arithmetic average of a dataset — sum of all values divided by the count. Used to measure central tendency when data is roughly symmetric and has no extreme outliers. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "100": {
    "correct": "<strong>D)</strong> <strong>Views can be used to restrict sensitive information.</strong> is the correct answer. <br><strong>What it is:</strong> Views can be used to restrict sensitive information. is a virtual table defined by a SQL query, stored as an object in the database. <br><strong>Why correct here:</strong> Does not store data itself; reflects the current data in the underlying tables when queried.",
    "wrong": "<strong>A)</strong> <em>Views reduce the need for repetitive, complex data joins.</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.<br><strong>B)</strong> <em>Views allow for the storage of temporary data, whereas tables do not.</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.<br><strong>C)</strong> <em>Views allow for the joining of multiple data sources, whereas tables do not.</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.",
    "domain": "General Data Concepts"
  },
  "101": {
    "correct": "<strong>A)</strong> <strong>Missing data</strong> is the correct answer. <br><strong>Concept:</strong> a data collection method that gathers information from respondents through questions. <br><strong>Why correct here:</strong> Provides primary data directly from the source. Can be structured (fixed questions) or unstructured (open-ended).",
    "wrong": "<strong>B)</strong> <em>Invalid data</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Redundant data</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Duplicate data</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "102": {
    "correct": "<strong>B)</strong> <strong>Release the report as user-group-based access and include data masking.</strong> is the correct answer. <br><strong>What it is:</strong> Release the report as user-group-based access and include data masking. is the technique of replacing sensitive data with realistic but fictitious values to protect it while retaining its usability. <br><strong>Why correct here:</strong> Used in development and testing environments to prevent exposure of real PII or sensitive data.",
    "wrong": "<strong>A)</strong> <em>Create an acceptable use policy for the sales data.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Get a data use agreement from the individual team members.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Provide the report based on role and include data encryption.</em> — This is the process of converting data into an unreadable format using an algorithm and a key, so only authorized parties can read it. At rest: encrypts stored data. In transit: encrypts data being transmitted (e.g., TLS/SSL). It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "103": {
    "correct": "<strong>B)</strong> <strong>Name</strong> is the correct answer. <br><strong>Concept:</strong> Personally Identifiable Information — any data that could be used to identify a specific individual. <br><strong>Why correct here:</strong> Examples: name, SSN, email, phone number, IP address, biometric data. Protected by laws like GDPR and HIPAA.",
    "wrong": "<strong>A)</strong> <em>Age</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Ethnicity</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Gender</em> — This is not the best answer for this scenario.",
    "domain": "Data Governance & Quality"
  },
  "104": {
    "correct": "<strong>C)</strong> <strong>Extract, transform, load</strong> is the correct answer. <br><strong>What it is:</strong> Extract, transform, load is ETL (Extract, Transform, Load). <br><strong>Why correct here:</strong> The standard data integration pipeline for moving data into a warehouse.",
    "wrong": "<strong>A)</strong> <em>Application programming interfaces</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Delta load</em> — This is Extract, Load, Transform — a variation of ETL where raw data is loaded first and then transformed inside the target system. Made practical by cloud data warehouses (Snowflake, BigQuery) that can handle transformation at scale. It does not answer this question correctly.<br><strong>D)</strong> <em>Export/import</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "105": {
    "correct": "<strong>C)</strong> <strong>Microsoft Power BI</strong> is the correct answer. <br><strong>What it is:</strong> Microsoft Power BI is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. <br><strong>Why correct here:</strong> Tools include Tableau, Power BI, Looker, and QlikView.",
    "wrong": "<strong>A)</strong> <em>Python</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>R</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>SAS</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "106": {
    "correct": "<strong>B)</strong> <strong>A waterfall chart</strong> is the correct answer. <br><strong>What it is:</strong> A waterfall chart is a chart that shows how an initial value is affected by a series of positive and negative changes, leading to a final value. <br><strong>Why correct here:</strong> Commonly used in financial analysis to show profit/loss breakdowns.",
    "wrong": "<strong>A)</strong> <em>A bubble chart</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>A scatter plot</em> — This is a chart that uses dots to show the relationship between two continuous variables. Used to identify correlation, clusters, and outliers. The x-axis is typically the independent variable. It does not answer this question correctly.<br><strong>D)</strong> <em>A line chart</em> — This is a chart that displays data points connected by lines to show trends over time. Best for continuous data and time series. Multiple lines allow comparison of trends across groups. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "107": {
    "correct": "<strong>B)</strong> <strong>Recurring</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>Dynamic</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Ad hoc</em> — This is performed or created for a specific purpose on an as-needed basis, not planned in advance. Ad hoc queries are one-time SQL queries written to answer a specific question, unlike scheduled reports. It does not answer this question correctly.<br><strong>D)</strong> <em>Self-service</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "108": {
    "correct": "<strong>B)</strong> <strong>Aggregate</strong> is the correct answer. <br><strong>What it is:</strong> Aggregate is a function that performs a calculation on a set of values and returns a single value. <br><strong>Why correct here:</strong> Examples: COUNT, SUM, AVG, MIN, MAX. Used with GROUP BY to calculate metrics per group.",
    "wrong": "<strong>A)</strong> <em>Statistical</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Logical</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Mathematical</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "109": {
    "correct": "<strong>A)</strong> <code>47mm</code> is the correct calculated answer. <br><em>Formula reminder:</em> Standard Deviation = √(Variance) = √[Σ(xᵢ - mean)² / N]",
    "wrong": "<strong>B)</strong> <em>54mm</em> — incorrect calculation result. <strong>C)</strong> <em>394mm</em> — incorrect calculation result. <strong>D)</strong> <em>21,704mm</em> — incorrect calculation result.",
    "domain": "Data Analysis & Statistics"
  },
  "110": {
    "correct": "<strong>D)</strong> <strong>Spearman’s rank correlation</strong> is the correct answer. <br><strong>What it is:</strong> Spearman’s rank correlation is a statistical measure of how strongly two variables move together, ranging from -1 to +1. <br><strong>Why correct here:</strong> Positive correlation: both increase together. Negative: one increases as the other decreases. 0 = no linear relationship.",
    "wrong": "<strong>A)</strong> <em>One-sample t-test</em> — This is a subset of a population selected to represent the whole. Sampling allows inference about a population without measuring every individual. It does not answer this question correctly.<br><strong>B)</strong> <em>Two-way ANOVA</em> — This is Analysis of Variance — a statistical test that compares means across three or more groups. Tests whether at least one group mean is different; follow-up tests identify which groups differ. It does not answer this question correctly.<br><strong>C)</strong> <em>Correlation coefficient</em> — This is a number between -1 and +1 quantifying the strength and direction of a linear relationship between two variables. Close to +1 or -1 = strong relationship; close to 0 = weak or no linear relationship. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "111": {
    "correct": "<strong>A)</strong> <strong>There is a 95% probability that the population mean lies within the stated interval.</strong> is the correct answer. <br><strong>What it is:</strong> There is a 95% probability that the population mean lies within the stated interval. is the arithmetic average of a dataset — sum of all values divided by the count. <br><strong>Why correct here:</strong> Used to measure central tendency when data is roughly symmetric and has no extreme outliers.",
    "wrong": "<strong>B)</strong> <em>A stated range may contain 95% of the population mean, 95% of the time.</em> — This is the arithmetic average of a dataset — sum of all values divided by the count. Used to measure central tendency when data is roughly symmetric and has no extreme outliers. It does not answer this question correctly.<br><strong>C)</strong> <em>A set of ranges contains the population mean with 95% certainty.</em> — This is the arithmetic average of a dataset — sum of all values divided by the count. Used to measure central tendency when data is roughly symmetric and has no extreme outliers. It does not answer this question correctly.<br><strong>D)</strong> <em>A range contains 95% of the population mean.</em> — This is the arithmetic average of a dataset — sum of all values divided by the count. Used to measure central tendency when data is roughly symmetric and has no extreme outliers. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "112": {
    "correct": "<strong>C)</strong> <strong>3</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>A)</strong> <em>• B. 2</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>4</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "113": {
    "correct": "<strong>C)</strong> <strong>Create a data field to data type validator to run the file through prior to import.</strong> is the correct answer. <br><strong>What it is:</strong> Create a data field to data type validator to run the file through prior to import. is a classification that specifies what kind of value a variable holds (e.g., integer, string, boolean, float). <br><strong>Why correct here:</strong> Determines what operations can be performed on the data and how much storage it requires.",
    "wrong": "<strong>A)</strong> <em>Delete all incorrect inputs and upload the corrected file.</em> — This is Common Table Expression — a named temporary result set defined with the WITH clause, used within a single SQL query. Improves readability and allows recursive queries. It does not answer this question correctly.<br><strong>B)</strong> <em>Have the user manually review the file for data completeness before loading it.</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.<br><strong>D)</strong> <em>Spot-check the file prior to import to catch and correct field errors.</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "114": {
    "correct": "<strong>C)</strong> <strong>3</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>A)</strong> <em>• B. 2</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>4</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "115": {
    "correct": "<strong>C)</strong> <strong>Item number, item name, salesperson, date sold, and price</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>Order number, salesperson, date shipped, recipient address, and price</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Item name, salesperson, recipient address, shipping cost, and date shipped</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Item name, salesperson, price, shipping cost, and date shipped</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "116": {
    "correct": "<strong>C)</strong> <strong>Rescale the data.</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>Normalize the data.</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Standardize the data.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Aggregate the data.</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "117": {
    "correct": "<strong>A)</strong> <strong>UNION ALL</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>B)</strong> <em>MERGE</em> — This is combining two or more datasets based on a common key or identifier. Equivalent to a SQL JOIN. Matches records from different datasets using a shared field. It does not answer this question correctly.<br><strong>C)</strong> <em>GROUP BY</em> — This is a SQL clause that groups rows sharing the same value in specified columns so aggregate functions can be applied per group. Always paired with aggregate functions like COUNT, SUM, or AVG. It does not answer this question correctly.<br><strong>D)</strong> <em>JOIN</em> — This is a SQL operation that combines rows from two or more tables based on a related column. Types: INNER (matching rows only), LEFT/RIGHT OUTER (all rows from one side), FULL OUTER (all rows from both sides), CROSS (all combinations). It does not answer this question correctly.",
    "domain": "General Data Concepts"
  },
  "118": {
    "correct": "<strong>A)</strong> <strong>Tons of steel produced per hour</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>B)</strong> <em>Annual sales budget</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>End-of-day stock price</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Daily corporate employee count</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "119": {
    "correct": "<strong>C)</strong> <strong>Weekly</strong> is the correct answer. <br><strong>Concept:</strong> the count of how many times a value or category appears in a dataset. <br><strong>Why correct here:</strong> Relative frequency = count / total. Used in histograms and frequency tables.",
    "wrong": "<strong>A)</strong> <em>Monthly</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Quarterly</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Every other month</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "120": {
    "correct": "<strong>B)</strong> <strong>An infographic</strong> is the correct answer for this question about <em>Visualization & Reporting</em>.",
    "wrong": "<strong>A)</strong> <em>A stacked chart</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>A word cloud</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>A tree map</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "121": {
    "correct": "<strong>B)</strong> <strong>Snowflake</strong> is the correct answer. <br><strong>What it is:</strong> Snowflake is a variation of the star schema where dimension tables are normalized into multiple related tables. <br><strong>Why correct here:</strong> Reduces data redundancy but requires more complex joins than a star schema.",
    "wrong": "<strong>A)</strong> <em>Flat</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Hierarchical</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Star</em> — This is a data warehouse design with a central fact table surrounded by dimension tables. Simple and fast for analytical queries. The fact table holds measurements; dimension tables hold descriptive attributes. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "122": {
    "correct": "<strong>B)</strong> <strong>A password-protected dashboard</strong> is the correct answer. <br><strong>What it is:</strong> A password-protected dashboard is Common Table Expression — a named temporary result set defined with the WITH clause, used within a single SQL query. <br><strong>Why correct here:</strong> Improves readability and allows recursive queries.",
    "wrong": "<strong>A)</strong> <em>An emailed report</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>C)</strong> <em>A daily printout of a report</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>D)</strong> <em>A cloud-hosted spreadsheet</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "123": {
    "correct": "<strong>A)</strong> <strong>Data is separated by a delimiter.</strong> is the correct answer. <br><strong>Concept:</strong> a classification that specifies what kind of value a variable holds (e.g., integer, string, boolean, float). <br><strong>Why correct here:</strong> Determines what operations can be performed on the data and how much storage it requires.",
    "wrong": "<strong>B)</strong> <em>Data is stored in defined rows.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data is defined with key-value pairs.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Data is housed in a markup language.</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "124": {
    "correct": "<strong>C)</strong> <strong>Recurring report</strong> is the correct answer. <br><strong>What it is:</strong> Recurring report is a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>Static report</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>B)</strong> <em>Tactical report</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>D)</strong> <em>Ad hoc report</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "125": {
    "correct": "<strong>D)</strong> <strong>Inconsistency</strong> is the correct answer. <br><strong>Concept:</strong> the process of examining a dataset to understand its structure, content, quality, and statistics. <br><strong>Why correct here:</strong> Identifies nulls, duplicates, value distributions, and format inconsistencies.",
    "wrong": "<strong>A)</strong> <em>Redundancy</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Duplication</em> — This is the process of identifying and removing duplicate records from a dataset. Critical for data quality. Can be done using SQL (DISTINCT, ROW_NUMBER()) or ETL tools. It does not answer this question correctly.<br><strong>C)</strong> <em>Invalidity</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "126": {
    "correct": "<strong>A)</strong> <strong>To perform web scraping</strong> is the correct answer. <br><strong>What it is:</strong> To perform web scraping is Application Programming Interface — a set of rules and protocols that allows different software applications to communicate with each other. <br><strong>Why correct here:</strong> REST APIs use HTTP requests to GET, POST, PUT, and DELETE data in JSON or XML format.",
    "wrong": "<strong>B)</strong> <em>To track KPIs</em> — This is Key Performance Indicator — a measurable value that demonstrates how effectively a company is achieving key business objectives. Examples: monthly revenue, customer churn rate, Net Promoter Score. Good KPIs are SMART: Specific, Measurable, Achievable, Relevant, Time-bound. It does not answer this question correctly.<br><strong>C)</strong> <em>To improve accuracy</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>To review data sets</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.<br><strong>E)</strong> <em>To increase the sample size</em> — This is a subset of a population selected to represent the whole. Sampling allows inference about a population without measuring every individual. It does not answer this question correctly.<br><strong>F)</strong> <em>To calculate trends</em> — This is the long-term direction (increasing, decreasing, or flat) in a time series. Identified by removing seasonality and noise from the data. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "127": {
    "correct": "<strong>D)</strong> <strong>discrete data.</strong> is the correct answer. <br><strong>What it is:</strong> discrete data. is data that can only take specific, countable values (e.g., number of customers, number of defects). <br><strong>Why correct here:</strong> Cannot be meaningfully subdivided — you cannot have 2.5 customers.",
    "wrong": "<strong>A)</strong> <em>continuous data.</em> — This is data that can take any value within a range (e.g., temperature, height, weight). Can be measured with arbitrary precision. Contrast with discrete data, which has countable values. It does not answer this question correctly.<br><strong>B)</strong> <em>categorical data.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>ordinal data.</em> — This is categorical data with a meaningful order but no consistent interval between values (e.g., satisfaction ratings: poor/fair/good). You can rank ordinal data but cannot calculate meaningful averages. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  },
  "128": {
    "correct": "<strong>B)</strong> <strong>LEFT JOIN, four rows</strong> is the correct answer. <br><strong>What it is:</strong> LEFT JOIN, four rows is a SQL operation that combines rows from two or more tables based on a related column. <br><strong>Why correct here:</strong> Types: INNER (matching rows only), LEFT/RIGHT OUTER (all rows from one side), FULL OUTER (all rows from both sides), CROSS (all combinations).",
    "wrong": "<strong>A)</strong> <em>INNER JOIN, two rows</em> — This is a SQL operation that combines rows from two or more tables based on a related column. Types: INNER (matching rows only), LEFT/RIGHT OUTER (all rows from one side), FULL OUTER (all rows from both sides), CROSS (all combinations). It does not answer this question correctly.<br><strong>C)</strong> <em>RIGHT JOIN, five rows</em> — This is a SQL operation that combines rows from two or more tables based on a related column. Types: INNER (matching rows only), LEFT/RIGHT OUTER (all rows from one side), FULL OUTER (all rows from both sides), CROSS (all combinations). It does not answer this question correctly.<br><strong>D)</strong> <em>OUTER JOIN, seven rows</em> — This is a SQL operation that combines rows from two or more tables based on a related column. Types: INNER (matching rows only), LEFT/RIGHT OUTER (all rows from one side), FULL OUTER (all rows from both sides), CROSS (all combinations). It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "129": {
    "correct": "<strong>C)</strong> <strong>To prevent SQL injections</strong> is the correct answer. <br><strong>What it is:</strong> To prevent SQL injections is Structured Query Language — the standard language for managing and querying relational databases. <br><strong>Why correct here:</strong> Core operations: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove), and DDL (define structure).",
    "wrong": "<strong>A)</strong> <em>To return a subset of records</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>To insert a temporary table</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>To increase the query speed</em> — This is a request to retrieve or manipulate data in a database. In SQL, a SELECT query specifies what data to retrieve and from where. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "130": {
    "correct": "<strong>C)</strong> <strong>Stratified sampling</strong> is the correct answer. <br><strong>What it is:</strong> Stratified sampling is dividing a population into subgroups (strata) and sampling from each proportionally. <br><strong>Why correct here:</strong> Ensures representation of all subgroups, especially minority groups.",
    "wrong": "<strong>A)</strong> <em>Systematic sampling</em> — This is selecting a subset of a population to estimate characteristics of the whole. Methods: random, stratified, cluster, systematic, and convenience sampling. It does not answer this question correctly.<br><strong>B)</strong> <em>Convenience sampling</em> — This is selecting a subset of a population to estimate characteristics of the whole. Methods: random, stratified, cluster, systematic, and convenience sampling. It does not answer this question correctly.<br><strong>D)</strong> <em>Random sampling</em> — This is a sampling method where every member of the population has an equal chance of being selected. Reduces bias and allows statistical inference about the population. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "131": {
    "correct": "<strong>C)</strong> <code>78.8</code> is the correct calculated answer. <br><em>Formula reminder:</em> Mean = Sum of all values ÷ Number of values",
    "wrong": "<strong>A)</strong> <em>73.5</em> — incorrect calculation result. <strong>B)</strong> <em>76.5</em> — incorrect calculation result. <strong>D)</strong> <em>81.5</em> — incorrect calculation result.",
    "domain": "Data Analysis & Statistics"
  },
  "132": {
    "correct": "<strong>C)</strong> <strong>Data aggregation</strong> is the correct answer. <br><strong>What it is:</strong> Data aggregation is the process of combining multiple data values into a single summary value (e.g., sum, count, average). <br><strong>Why correct here:</strong> Required for moving from row-level detail to summary metrics for reporting.",
    "wrong": "<strong>A)</strong> <em>Data normalization</em> — This is the process of organizing a database to reduce redundancy and improve data integrity. Higher normal forms (1NF, 2NF, 3NF, BCNF) eliminate different types of data anomalies. It does not answer this question correctly.<br><strong>B)</strong> <em>Data append</em> — This is adding new rows (records) to an existing dataset. Differs from joining, which adds new columns. Used when combining data from the same source over different time periods. It does not answer this question correctly.<br><strong>D)</strong> <em>Data blending</em> — This is combining data from multiple sources into a single analysis without fully integrating them into one database. Used in BI tools (e.g., Tableau) to join data from different connections on the fly. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "133": {
    "correct": "<strong>A)</strong> <strong>Involves the use of descriptive statistics to understand observations</strong> is the correct answer. <br><strong>What it is:</strong> Involves the use of descriptive statistics to understand observations is a data collection method where data is gathered by watching subjects in their natural environment. <br><strong>Why correct here:</strong> Minimizes the Hawthorne effect if subjects are unaware they are being observed.",
    "wrong": "<strong>B)</strong> <em>Involves analysis of exploring data sets for performance tracking</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Involves the testing of specific hypotheses</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Involves the use of arithmetic algebra to determine the distribution</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "134": {
    "correct": "<strong>A)</strong> <strong>A self-serve dashboard of website performance that updates in real time</strong> is the correct answer. <br><strong>What it is:</strong> A self-serve dashboard of website performance that updates in real time is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. <br><strong>Why correct here:</strong> Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights.",
    "wrong": "<strong>B)</strong> <em>A weekly log report of site visits and user actions</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>C)</strong> <em>A portal that is refreshed daily and reports errors classified by type</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>D)</strong> <em>A daily summary email indicating website outages for the previous day</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "135": {
    "correct": "<strong>C)</strong> <strong>Indexing documents</strong> is the correct answer. <br><strong>What it is:</strong> Indexing documents is a database structure that improves the speed of data retrieval operations on a table. <br><strong>Why correct here:</strong> Like a book's index — allows the database to find rows without scanning the entire table.",
    "wrong": "<strong>A)</strong> <em>Making a temporary table</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Creating a flat file</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Creating an execution plan</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "136": {
    "correct": "<strong>B)</strong> <strong>As a sample size grows, its mean gets closer to the average of the whole population.</strong> is the correct answer. <br><strong>What it is:</strong> As a sample size grows, its mean gets closer to the average of the whole population. is the arithmetic average of a dataset — sum of all values divided by the count. <br><strong>Why correct here:</strong> Used to measure central tendency when data is roughly symmetric and has no extreme outliers.",
    "wrong": "<strong>A)</strong> <em>As a sample size decreases, its standard deviation gets closer to the average of the whole population.</em> — This is the arithmetic mean — sum of all values divided by the count. The most common measure of central tendency for symmetric datasets. It does not answer this question correctly.<br><strong>C)</strong> <em>As a sample size decreases, its mean gets closer to the average of the whole population.</em> — This is the arithmetic average of a dataset — sum of all values divided by the count. Used to measure central tendency when data is roughly symmetric and has no extreme outliers. It does not answer this question correctly.<br><strong>D)</strong> <em>When a sample size doubles, the sample is indicative of the whole population.</em> — This is a subset of a population selected to represent the whole. Sampling allows inference about a population without measuring every individual. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "137": {
    "correct": "<strong>D)</strong> <strong>To track measurements against defined goals</strong> is the correct answer. <br><strong>Concept:</strong> Key Performance Indicator — a measurable value that demonstrates how effectively a company is achieving key business objectives. <br><strong>Why correct here:</strong> Examples: monthly revenue, customer churn rate, Net Promoter Score. Good KPIs are SMART: Specific, Measurable, Achievable, Relevant, Time-bound.",
    "wrong": "<strong>A)</strong> <em>To analyze a connection of data points or pathways</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>To use descriptive statistics to determine observations</em> — This is a data collection method where data is gathered by watching subjects in their natural environment. Minimizes the Hawthorne effect if subjects are unaware they are being observed. It does not answer this question correctly.<br><strong>C)</strong> <em>To provide a comparison of data over time</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "138": {
    "correct": "<strong>B)</strong> <strong>Complete a check for quality in the report.</strong> is the correct answer. <br><strong>What it is:</strong> Complete a check for quality in the report. is a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>Complete an audit on the data pulled for the report.</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>C)</strong> <em>Complete a review of the data and a check for consistency.</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.<br><strong>D)</strong> <em>Complete a trend analysis to be included in the report.</em> — This is the long-term direction (increasing, decreasing, or flat) in a time series. Identified by removing seasonality and noise from the data. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "139": {
    "correct": "<strong>C)</strong> <strong>Increase the frequency of report generation.</strong> is the correct answer. <br><strong>What it is:</strong> Increase the frequency of report generation. is numeric data with equal intervals AND a true zero point (e.g., height, weight, income). <br><strong>Why correct here:</strong> Both differences and ratios are meaningful — $100 is twice $50.",
    "wrong": "<strong>A)</strong> <em>Modify the date range on the report.</em> — This is the difference between the maximum and minimum values in a dataset. A simple but outlier-sensitive measure of spread. It does not answer this question correctly.<br><strong>B)</strong> <em>Include a time stamp on the report.</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>D)</strong> <em>Add a report run date to the report.</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "140": {
    "correct": "<strong>C)</strong> <strong>Information containing definitions of the business data</strong> is the correct answer. <br><strong>Concept:</strong> a repository that defines the meaning, format, and usage of data elements within a system. <br><strong>Why correct here:</strong> Helps ensure consistent understanding and use of data across teams.",
    "wrong": "<strong>A)</strong> <em>Information containing the links to business data</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Information explaining the business methodologies</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Information describing the data analysis phases</em> — This is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. Tools include Tableau, Power BI, Looker, and QlikView. It does not answer this question correctly.",
    "domain": "General Data Concepts"
  },
  "141": {
    "correct": "<strong>A)</strong> <strong>.html</strong> is the correct answer. <br><strong>Concept:</strong> Application Programming Interface — a set of rules and protocols that allows different software applications to communicate with each other. <br><strong>Why correct here:</strong> REST APIs use HTTP requests to GET, POST, PUT, and DELETE data in JSON or XML format.",
    "wrong": "<strong>B)</strong> <em>.txt</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>.csv</em> — This is Comma-Separated Values — a plain text format for storing tabular data with each row on a new line and columns separated by commas. Simple, widely supported, but lacks support for data types and complex structures. It does not answer this question correctly.<br><strong>D)</strong> <em>.tsv</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "142": {
    "correct": "<strong>B)</strong> <code>4.8%</code> is the correct calculated answer. <br><em>Formula reminder:</em> Apply the relevant formula step-by-step, then verify units match the answer choices.",
    "wrong": "<strong>A)</strong> <em>3.2%</em> — incorrect calculation result. <strong>C)</strong> <em>22.3%</em> — incorrect calculation result. <strong>D)</strong> <em>85.2%</em> — incorrect calculation result.",
    "domain": "General Data Concepts"
  },
  "143": {
    "correct": "<strong>B)</strong> <strong>Text</strong> is the correct answer. <br><strong>Concept:</strong> a classification that specifies what kind of value a variable holds (e.g., integer, string, boolean, float). <br><strong>Why correct here:</strong> Determines what operations can be performed on the data and how much storage it requires.",
    "wrong": "<strong>A)</strong> <em>Numeric</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Currency</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Alphanumeric</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "144": {
    "correct": "<strong>D)</strong> <strong>Data consolidation</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>A)</strong> <em>Data audit</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Data completeness</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data validation</em> — This is the process of ensuring that data meets defined quality rules before it is used or stored. Checks for completeness, format correctness, range validity, and referential integrity. It does not answer this question correctly.",
    "domain": "General Data Concepts"
  },
  "145": {
    "correct": "<strong>C)</strong> <strong>multicollinearity.</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>A)</strong> <em>outliers.</em> — This is a data point that is significantly different from the rest of the dataset. Can distort the mean and standard deviation. Often handled by removing, capping, or transforming the value. It does not answer this question correctly.<br><strong>B)</strong> <em>non-parametric data.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>invalid data.</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "146": {
    "correct": "<strong>A)</strong> <strong>A version control table</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>B)</strong> <em>Reference data sources</em> — This is any system, file, or location from which data is collected. Can be internal (CRM, ERP, databases) or external (APIs, web, government data). It does not answer this question correctly.<br><strong>C)</strong> <em>Instructions</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>A report run date</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "147": {
    "correct": "<strong>A)</strong> <strong>Multiple redundant data fields</strong> is the correct answer. <br><strong>Concept:</strong> a database that organizes data into tables (relations) with rows and columns, linked by keys. <br><strong>Why correct here:</strong> Uses SQL for querying. Examples: MySQL, PostgreSQL, SQL Server, Oracle.",
    "wrong": "<strong>B)</strong> <em>Non-compliance with regulations</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Unstandardized field names</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Difficulties with personnel continuity</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "148": {
    "correct": "<strong>D)</strong> <strong>Discrete values are obtained by counting.</strong> is the correct answer. <br><strong>What it is:</strong> Discrete values are obtained by counting. is data that can only take specific, countable values (e.g., number of customers, number of defects). <br><strong>Why correct here:</strong> Cannot be meaningfully subdivided — you cannot have 2.5 customers.",
    "wrong": "<strong>A)</strong> <em>Discrete values change.</em> — This is data that can only take specific, countable values (e.g., number of customers, number of defects). Cannot be meaningfully subdivided — you cannot have 2.5 customers. It does not answer this question correctly.<br><strong>B)</strong> <em>Discrete values are not distinct.</em> — This is data that can only take specific, countable values (e.g., number of customers, number of defects). Cannot be meaningfully subdivided — you cannot have 2.5 customers. It does not answer this question correctly.<br><strong>C)</strong> <em>Continuous values are restricted by separation.</em> — This is data that can take any value within a range (e.g., temperature, height, weight). Can be measured with arbitrary precision. Contrast with discrete data, which has countable values. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  },
  "149": {
    "correct": "<strong>B)</strong> <strong>Ordinal</strong> is the correct answer. <br><strong>What it is:</strong> Ordinal is categorical data with a meaningful order but no consistent interval between values (e.g., satisfaction ratings: poor/fair/good). <br><strong>Why correct here:</strong> You can rank ordinal data but cannot calculate meaningful averages.",
    "wrong": "<strong>A)</strong> <em>Continuous</em> — This is data that can take any value within a range (e.g., temperature, height, weight). Can be measured with arbitrary precision. Contrast with discrete data, which has countable values. It does not answer this question correctly.<br><strong>C)</strong> <em>Categorical</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Nominal</em> — This is categorical data with no inherent order (e.g., colors, gender, country). Only equality/inequality can be assessed — no ranking or arithmetic is meaningful. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  },
  "150": {
    "correct": "<strong>A)</strong> <strong>Clarify the goal of the reporting and work to pare down the requirements for a more effective use of data and a streamlined view.</strong> is the correct answer. <br><strong>What it is:</strong> Clarify the goal of the reporting and work to pare down the requirements for a more effective use of data and a streamlined view. is a virtual table defined by a SQL query, stored as an object in the database. <br><strong>Why correct here:</strong> Does not store data itself; reflects the current data in the underlying tables when queried.",
    "wrong": "<strong>B)</strong> <em>Create a dashboard wireframe/mockup and send it to the director and C-suite users for review and approval before moving forward.</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.<br><strong>C)</strong> <em>Develop a dashboard with multiple views managed by permissions so executives only see the information relevant to them individually.</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.<br><strong>D)</strong> <em>Build an interactive dashboard so users can drill down to the most relevant information through the use of saved searches and filters.</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "151": {
    "correct": "<strong>C)</strong> <strong>Dependent t-test</strong> is the correct answer. <br><strong>What it is:</strong> Dependent t-test is a statistical test that compares the means of one or two groups to determine if they differ significantly. <br><strong>Why correct here:</strong> Used when sample sizes are small or population standard deviation is unknown.",
    "wrong": "<strong>A)</strong> <em>Correlation test</em> — This is a statistical measure of how strongly two variables move together, ranging from -1 to +1. Positive correlation: both increase together. Negative: one increases as the other decreases. 0 = no linear relationship. It does not answer this question correctly.<br><strong>B)</strong> <em>Independent chi-squared test</em> — This is a statistical test used to determine if there is a significant association between two categorical variables. Compares observed frequencies to expected frequencies under the null hypothesis. It does not answer this question correctly.<br><strong>D)</strong> <em>Z-test</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "152": {
    "correct": "<strong>B)</strong> <strong>Ordinal variable</strong> is the correct answer. <br><strong>What it is:</strong> Ordinal variable is categorical data with a meaningful order but no consistent interval between values (e.g., satisfaction ratings: poor/fair/good). <br><strong>Why correct here:</strong> You can rank ordinal data but cannot calculate meaningful averages.",
    "wrong": "<strong>A)</strong> <em>Discrete variable</em> — This is data that can only take specific, countable values (e.g., number of customers, number of defects). Cannot be meaningfully subdivided — you cannot have 2.5 customers. It does not answer this question correctly.<br><strong>C)</strong> <em>Numerical variable</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Continuous variable</em> — This is data that can take any value within a range (e.g., temperature, height, weight). Can be measured with arbitrary precision. Contrast with discrete data, which has countable values. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  },
  "153": {
    "correct": "<strong>C)</strong> <strong>Snowflake</strong> is the correct answer. <br><strong>What it is:</strong> Snowflake is a variation of the star schema where dimension tables are normalized into multiple related tables. <br><strong>Why correct here:</strong> Reduces data redundancy but requires more complex joins than a star schema.",
    "wrong": "<strong>A)</strong> <em>Non-relational</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Galaxy</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Star</em> — This is a data warehouse design with a central fact table surrounded by dimension tables. Simple and fast for analytical queries. The fact table holds measurements; dimension tables hold descriptive attributes. It does not answer this question correctly.",
    "domain": "Databases & Data Concepts"
  },
  "154": {
    "correct": "<strong>C)</strong> <strong>Creating a codebook to document field changes</strong> is the correct answer. <br><strong>Concept:</strong> any system, file, or location from which data is collected. <br><strong>Why correct here:</strong> Can be internal (CRM, ERP, databases) or external (APIs, web, government data).",
    "wrong": "<strong>A)</strong> <em>Placing old data in new fields</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Keeping only the most recent data</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Removing the data source from production</em> — This is any system, file, or location from which data is collected. Can be internal (CRM, ERP, databases) or external (APIs, web, government data). It does not answer this question correctly.",
    "domain": "General Data Concepts"
  },
  "155": {
    "correct": "<strong>C)</strong> <strong>A datapoint that differs significantly from other observations</strong> is the correct answer. <br><strong>What it is:</strong> A datapoint that differs significantly from other observations is a data collection method where data is gathered by watching subjects in their natural environment. <br><strong>Why correct here:</strong> Minimizes the Hawthorne effect if subjects are unaware they are being observed.",
    "wrong": "<strong>A)</strong> <em>A datapoint that is significantly close to the trend line</em> — This is the long-term direction (increasing, decreasing, or flat) in a time series. Identified by removing seasonality and noise from the data. It does not answer this question correctly.<br><strong>B)</strong> <em>A datapoint that has the highest significant number of observations</em> — This is a data collection method where data is gathered by watching subjects in their natural environment. Minimizes the Hawthorne effect if subjects are unaware they are being observed. It does not answer this question correctly.<br><strong>D)</strong> <em>A datapoint that is above the trend line</em> — This is the long-term direction (increasing, decreasing, or flat) in a time series. Identified by removing seasonality and noise from the data. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "156": {
    "correct": "<strong>A)</strong> <strong>Create access permissions so users only see data that is applicable to their user group.</strong> is the correct answer. <br><strong>Concept:</strong> numeric data with equal intervals AND a true zero point (e.g., height, weight, income). <br><strong>Why correct here:</strong> Both differences and ratios are meaningful — $100 is twice $50.",
    "wrong": "<strong>B)</strong> <em>Make the dashboard interactive so users can find the data that applies to them.</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.<br><strong>C)</strong> <em>Create an option to save an individual user’s searches and filters by user ID.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Create three separate dashboards, one for each user group.</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "157": {
    "correct": "<strong>A)</strong> <strong>• B.</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>C)</strong> <em>• D.</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "158": {
    "correct": "<strong>D)</strong> <strong>Replace the static data update with a continuous feed.</strong> is the correct answer. <br><strong>What it is:</strong> Replace the static data update with a continuous feed. is data that can take any value within a range (e.g., temperature, height, weight). <br><strong>Why correct here:</strong> Can be measured with arbitrary precision. Contrast with discrete data, which has countable values.",
    "wrong": "<strong>A)</strong> <em>Add filters to the dashboard so users can find the data they are looking for.</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.<br><strong>B)</strong> <em>Schedule delivery so users know when to look for updated data.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Add a data refresh date to the dashboard so users know when the data was last updated.</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "159": {
    "correct": "<strong>D)</strong> <strong>Data transformation</strong> is the correct answer. <br><strong>What it is:</strong> Data transformation is converting data from one format, structure, or value set to another. <br><strong>Why correct here:</strong> Includes type conversion, normalization, aggregation, and encoding.",
    "wrong": "<strong>A)</strong> <em>Data source</em> — This is any system, file, or location from which data is collected. Can be internal (CRM, ERP, databases) or external (APIs, web, government data). It does not answer this question correctly.<br><strong>B)</strong> <em>Data product</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data retrieval</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "160": {
    "correct": "<strong>A)</strong> <strong>XML</strong> is the correct answer. <br><strong>What it is:</strong> XML is Extensible Markup Language — a text format that uses tags to define the structure of data. <br><strong>Why correct here:</strong> More verbose than JSON. Still widely used in legacy enterprise systems and configuration files.",
    "wrong": "<strong>B)</strong> <em>CSV</em> — This is Comma-Separated Values — a plain text format for storing tabular data with each row on a new line and columns separated by commas. Simple, widely supported, but lacks support for data types and complex structures. It does not answer this question correctly.<br><strong>C)</strong> <em>XLS</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>PNG</em> — This is not the best answer for this scenario.<br><strong>E)</strong> <em>JSON</em> — This is JavaScript Object Notation — a lightweight, human-readable data format used for transmitting data between a server and web application. Uses key-value pairs and arrays. Widely used in REST APIs and NoSQL databases. It does not answer this question correctly.<br><strong>F)</strong> <em>MP4</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "161": {
    "correct": "<strong>D)</strong> <strong>Company branding</strong> is the correct answer for this question about <em>Data Analysis & Statistics</em>.",
    "wrong": "<strong>A)</strong> <em>A watermark</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>The version number</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>A distribution list</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "162": {
    "correct": "<strong>A)</strong> <strong>Redundant data</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>B)</strong> <em>Invalid data</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Duplicate data</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Missing data</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "163": {
    "correct": "<strong>A)</strong> <strong>Data completeness</strong> is the correct answer. <br><strong>Concept:</strong> a data collection method that gathers information from respondents through questions. <br><strong>Why correct here:</strong> Provides primary data directly from the source. Can be structured (fixed questions) or unstructured (open-ended).",
    "wrong": "<strong>B)</strong> <em>Data integrity</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data consistency</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Data accuracy</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "164": {
    "correct": "<strong>C)</strong> <strong>SQL</strong> is the correct answer. <br><strong>What it is:</strong> SQL is Structured Query Language — the standard language for managing and querying relational databases. <br><strong>Why correct here:</strong> Core operations: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove), and DDL (define structure).",
    "wrong": "<strong>A)</strong> <em>R</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Python</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>SAS</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "165": {
    "correct": "<strong>A)</strong> <strong>Data attribute limitations</strong> is the correct answer. <br><strong>Concept:</strong> the arithmetic mean — sum of all values divided by the count. <br><strong>Why correct here:</strong> The most common measure of central tendency for symmetric datasets.",
    "wrong": "<strong>B)</strong> <em>Data accuracy</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data completeness</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Data manipulation</em> — This is not the best answer for this scenario.<br><strong>E)</strong> <em>Data blending</em> — This is combining data from multiple sources into a single analysis without fully integrating them into one database. Used in BI tools (e.g., Tableau) to join data from different connections on the fly. It does not answer this question correctly.<br><strong>F)</strong> <em>Data consistency</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "166": {
    "correct": "<strong>D)</strong> <strong>String manipulation</strong> is the correct answer. <br><strong>What it is:</strong> String manipulation is a sequence of characters used to represent text. <br><strong>Why correct here:</strong> Stored in quotes; operations include concatenation, substring, length, and pattern matching.",
    "wrong": "<strong>A)</strong> <em>Data blending</em> — This is combining data from multiple sources into a single analysis without fully integrating them into one database. Used in BI tools (e.g., Tableau) to join data from different connections on the fly. It does not answer this question correctly.<br><strong>B)</strong> <em>Data appending</em> — This is adding new rows (records) to an existing dataset. Differs from joining, which adds new columns. Used when combining data from the same source over different time periods. It does not answer this question correctly.<br><strong>C)</strong> <em>Imputation</em> — This is the process of replacing missing values with substituted values (e.g., mean, median, or a predicted value). Preserves dataset size but introduces bias if not done carefully. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "167": {
    "correct": "<strong>C)</strong> <strong>Text</strong> is the correct answer. <br><strong>Concept:</strong> a classification that specifies what kind of value a variable holds (e.g., integer, string, boolean, float). <br><strong>Why correct here:</strong> Determines what operations can be performed on the data and how much storage it requires.",
    "wrong": "<strong>A)</strong> <em>Boolean</em> — This is a data type with only two possible values: true or false (or 1/0). Used in logic, filters, and conditional operations. It does not answer this question correctly.<br><strong>B)</strong> <em>Date</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Number</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "168": {
    "correct": "<strong>C)</strong> <strong>Connect the input to a live connection within the data warehouse that refreshes daily.</strong> is the correct answer. <br><strong>What it is:</strong> Connect the input to a live connection within the data warehouse that refreshes daily. is a centralized repository designed for storing large volumes of historical, structured data for analytical reporting and business intelligence. <br><strong>Why correct here:</strong> Data is integrated from multiple sources and optimized for read-heavy analytical queries, not real-time transactions.",
    "wrong": "<strong>A)</strong> <em>Connect the input to a CSV file that can be replaced daily.</em> — This is Comma-Separated Values — a plain text format for storing tabular data with each row on a new line and columns separated by commas. Simple, widely supported, but lacks support for data types and complex structures. It does not answer this question correctly.<br><strong>B)</strong> <em>Connect the input to an extract that can be replaced daily by a member of the team.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Connect the input to a Microsoft Excel macro that is updated daily on schedule and then fed into the connection.</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "169": {
    "correct": "<strong>D)</strong> <strong>Web scraping</strong> is the correct answer. <br><strong>What it is:</strong> Web scraping is Application Programming Interface — a set of rules and protocols that allows different software applications to communicate with each other. <br><strong>Why correct here:</strong> REST APIs use HTTP requests to GET, POST, PUT, and DELETE data in JSON or XML format.",
    "wrong": "<strong>A)</strong> <em>Web data collection</em> — This is the process of gathering raw data from various sources for analysis. Methods: surveys, sensors, web scraping, APIs, manual entry, and automated data feeds. It does not answer this question correctly.<br><strong>B)</strong> <em>Data acquisition</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data merging</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "170": {
    "correct": "<strong>A)</strong> <strong>Simple random sampling</strong> is the correct answer. <br><strong>What it is:</strong> Simple random sampling is selecting a subset of a population to estimate characteristics of the whole. <br><strong>Why correct here:</strong> Methods: random, stratified, cluster, systematic, and convenience sampling.",
    "wrong": "<strong>B)</strong> <em>Parameterization sampling</em> — This is selecting a subset of a population to estimate characteristics of the whole. Methods: random, stratified, cluster, systematic, and convenience sampling. It does not answer this question correctly.<br><strong>C)</strong> <em>Index sampling</em> — This is a database structure that improves the speed of data retrieval operations on a table. Like a book's index — allows the database to find rows without scanning the entire table. It does not answer this question correctly.<br><strong>D)</strong> <em>Single-stage sampling</em> — This is selecting a subset of a population to estimate characteristics of the whole. Methods: random, stratified, cluster, systematic, and convenience sampling. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "171": {
    "correct": "<strong>A)</strong> <strong>Remove duplicate data.</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>B)</strong> <em>Remove outliers.</em> — This is a data point that is significantly different from the rest of the dataset. Can distort the mean and standard deviation. Often handled by removing, capping, or transforming the value. It does not answer this question correctly.<br><strong>C)</strong> <em>Verify the data.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Add missing values.</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "172": {
    "correct": "<strong>C)</strong> <strong>A trend analysis</strong> is the correct answer. <br><strong>What it is:</strong> A trend analysis is the long-term direction (increasing, decreasing, or flat) in a time series. <br><strong>Why correct here:</strong> Identified by removing seasonality and noise from the data.",
    "wrong": "<strong>A)</strong> <em>A gap analysis</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>A link analysis</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>A statistical analysis</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "173": {
    "correct": "<strong>D)</strong> <strong>An audio file</strong> is the correct answer. <br><strong>Concept:</strong> data organized in a predefined format, typically rows and columns in a table or spreadsheet. <br><strong>Why correct here:</strong> Easy to store in relational databases and query with SQL. Examples: transaction records, survey responses.",
    "wrong": "<strong>A)</strong> <em>A JSON file</em> — This is JavaScript Object Notation — a lightweight, human-readable data format used for transmitting data between a server and web application. Uses key-value pairs and arrays. Widely used in REST APIs and NoSQL databases. It does not answer this question correctly.<br><strong>B)</strong> <em>A relational database</em> — This is a database that organizes data into tables (relations) with rows and columns, linked by keys. Uses SQL for querying. Examples: MySQL, PostgreSQL, SQL Server, Oracle. It does not answer this question correctly.<br><strong>C)</strong> <em>A CSV file</em> — This is Comma-Separated Values — a plain text format for storing tabular data with each row on a new line and columns separated by commas. Simple, widely supported, but lacks support for data types and complex structures. It does not answer this question correctly.",
    "domain": "Databases & Data Concepts"
  },
  "174": {
    "correct": "<strong>B)</strong> <strong>Variance</strong> is the correct answer. <br><strong>What it is:</strong> Variance is the average of the squared differences from the mean; measures how spread out data is. <br><strong>Why correct here:</strong> Squaring removes negatives and amplifies large deviations, making it sensitive to outliers.",
    "wrong": "<strong>A)</strong> <em>Mean</em> — This is the arithmetic average of a dataset — sum of all values divided by the count. Used to measure central tendency when data is roughly symmetric and has no extreme outliers. It does not answer this question correctly.<br><strong>C)</strong> <em>Correlation</em> — This is a statistical measure of how strongly two variables move together, ranging from -1 to +1. Positive correlation: both increase together. Negative: one increases as the other decreases. 0 = no linear relationship. It does not answer this question correctly.<br><strong>D)</strong> <em>Confidence interval</em> — This is a range of values that likely contains the true population parameter with a given level of confidence (e.g., 95%). A 95% CI means that if you repeated the study 100 times, ~95 of the intervals would contain the true value. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "175": {
    "correct": "<strong>C)</strong> <strong>Sorting</strong> is the correct answer. <br><strong>What it is:</strong> Sorting is arranging data in ascending or descending order based on one or more columns. <br><strong>Why correct here:</strong> Fundamental data operation for ranking, display, and identifying extremes.",
    "wrong": "<strong>A)</strong> <em>Aggregating</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Transposing</em> — This is swapping the rows and columns of a dataset so rows become columns and vice versa. Useful for reshaping data for different analysis or display requirements. It does not answer this question correctly.<br><strong>D)</strong> <em>Consolidating</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "176": {
    "correct": "<strong>D)</strong> <strong>Mean: 6 - Median: 7 - Mode: 7</strong> is the correct answer. <br><strong>What it is:</strong> Mean: 6 - Median: 7 - Mode: 7 is the arithmetic average of a dataset — sum of all values divided by the count. <br><strong>Why correct here:</strong> Used to measure central tendency when data is roughly symmetric and has no extreme outliers.",
    "wrong": "<strong>A)</strong> <em>Mean: 5 - Median: 3 - Mode: 7 -</em> — This is the arithmetic average of a dataset — sum of all values divided by the count. Used to measure central tendency when data is roughly symmetric and has no extreme outliers. It does not answer this question correctly.<br><strong>B)</strong> <em>Mean: 5 - Median: 7 - Mode: 7 -</em> — This is the arithmetic average of a dataset — sum of all values divided by the count. Used to measure central tendency when data is roughly symmetric and has no extreme outliers. It does not answer this question correctly.<br><strong>C)</strong> <em>Mean: 6 - Median: 3 - Mode: 7 -</em> — This is the arithmetic average of a dataset — sum of all values divided by the count. Used to measure central tendency when data is roughly symmetric and has no extreme outliers. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "177": {
    "correct": "<strong>C)</strong> <strong>.tsv</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>A)</strong> <em>.tap</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>.tar</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>.taz</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "178": {
    "correct": "<strong>C)</strong> <strong>A performance analysis</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>A)</strong> <em>A sales analysis</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>A link analysis</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>A trend analysis</em> — This is the long-term direction (increasing, decreasing, or flat) in a time series. Identified by removing seasonality and noise from the data. It does not answer this question correctly.",
    "domain": "General Data Concepts"
  },
  "179": {
    "correct": "<strong>B)</strong> <strong>Consolidation</strong> is the correct answer for this question about <em>Data Governance & Quality</em>.",
    "wrong": "<strong>A)</strong> <em>Duplication</em> — This is the process of identifying and removing duplicate records from a dataset. Critical for data quality. Can be done using SQL (DISTINCT, ROW_NUMBER()) or ETL tools. It does not answer this question correctly.<br><strong>C)</strong> <em>Compliance</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Standardization</em> — This is not the best answer for this scenario.",
    "domain": "Data Governance & Quality"
  },
  "180": {
    "correct": "<strong>D)</strong> <strong>Data governance is the availability, usability, integrity and security of data in an enterprise.</strong> is the correct answer. <br><strong>What it is:</strong> Data governance is the availability, usability, integrity and security of data in an enterprise. is the set of policies, standards, and processes that ensure data is managed consistently and used responsibly across an organization. <br><strong>Why correct here:</strong> Includes defining data ownership, quality standards, access controls, and compliance requirements.",
    "wrong": "<strong>A)</strong> <em>Data governance governs the development of a data visualization dashboard in an organization.</em> — This is the set of policies, standards, and processes that ensure data is managed consistently and used responsibly across an organization. Includes defining data ownership, quality standards, access controls, and compliance requirements. It does not answer this question correctly.<br><strong>B)</strong> <em>Data governance is the policy that protects against data breaches by cybercriminals.</em> — This is the set of policies, standards, and processes that ensure data is managed consistently and used responsibly across an organization. Includes defining data ownership, quality standards, access controls, and compliance requirements. It does not answer this question correctly.<br><strong>C)</strong> <em>Data governance is the process of analyzing, manipulating, and reporting data in an organization.</em> — This is the set of policies, standards, and processes that ensure data is managed consistently and used responsibly across an organization. Includes defining data ownership, quality standards, access controls, and compliance requirements. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "181": {
    "correct": "<strong>D)</strong> <strong>Alphanumeric</strong> is the correct answer. <br><strong>Concept:</strong> a classification that specifies what kind of value a variable holds (e.g., integer, string, boolean, float). <br><strong>Why correct here:</strong> Determines what operations can be performed on the data and how much storage it requires.",
    "wrong": "<strong>A)</strong> <em>Character</em> — This is Common Table Expression — a named temporary result set defined with the WITH clause, used within a single SQL query. Improves readability and allows recursive queries. It does not answer this question correctly.<br><strong>B)</strong> <em>Float</em> — This is a number with a decimal component (floating-point number). Used for measurements and calculations requiring precision beyond whole numbers. It does not answer this question correctly.<br><strong>C)</strong> <em>Integer</em> — This is a whole number with no decimal component. Used for counts and discrete quantities. Operations include arithmetic. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  },
  "182": {
    "correct": "<strong>D)</strong> <strong>Review the files separately and ensure the blended totals match.</strong> is the correct answer. <br><strong>What it is:</strong> Review the files separately and ensure the blended totals match. is a virtual table defined by a SQL query, stored as an object in the database. <br><strong>Why correct here:</strong> Does not store data itself; reflects the current data in the underlying tables when queried.",
    "wrong": "<strong>A)</strong> <em>Assume the data was blended together and wait for feedback.</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Filter on every column to look for inconsistencies in the data.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Spot check a few numbers to look for inconsistencies.</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "183": {
    "correct": "<strong>C)</strong> <code>4</code> is the correct calculated answer. <br><em>Formula reminder:</em> Mean = Sum of all values ÷ Number of values",
    "wrong": "<strong>A)</strong> <em>2</em> — incorrect calculation result. <strong>B)</strong> <em>3</em> — incorrect calculation result. <strong>D)</strong> <em>7</em> — incorrect calculation result.",
    "domain": "Data Analysis & Statistics"
  },
  "184": {
    "correct": "<strong>B)</strong> <code>$6,297</code> is the correct calculated answer. <br><em>Formula reminder:</em> Apply the relevant formula step-by-step, then verify units match the answer choices.",
    "wrong": "<strong>A)</strong> <em>$5,402</em> — incorrect calculation result. <strong>C)</strong> <em>$7,634</em> — incorrect calculation result. <strong>D)</strong> <em>$8,642</em> — incorrect calculation result.",
    "domain": "General Data Concepts"
  },
  "185": {
    "correct": "<strong>C)</strong> <strong>Build a scatter plot of each variable and look for observations that are out of place.</strong> is the correct answer. <br><strong>What it is:</strong> Build a scatter plot of each variable and look for observations that are out of place. is a chart that uses dots to show the relationship between two continuous variables. <br><strong>Why correct here:</strong> Used to identify correlation, clusters, and outliers. The x-axis is typically the independent variable.",
    "wrong": "<strong>A)</strong> <em>Plot the linear correlations between each pair of variables and look for unusual relationships</em> — This is a statistical measure of how strongly two variables move together, ranging from -1 to +1. Positive correlation: both increase together. Negative: one increases as the other decreases. 0 = no linear relationship. It does not answer this question correctly.<br><strong>B)</strong> <em>Create a bar chart for each variable and look for any distributions that are unusual.</em> — This is a chart using rectangular bars to compare values across different categories. Horizontal bars are useful for long category labels. Vertical bars (column charts) emphasize change over time. It does not answer this question correctly.<br><strong>D)</strong> <em>Order each variable in a spreadsheet from lowest to highest and look for unusual numbers at the beginning or at the end of the list.</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "186": {
    "correct": "<strong>B)</strong> <strong>A word cloud</strong> is the correct answer. <br><strong>Concept:</strong> a data collection method that gathers information from respondents through questions. <br><strong>Why correct here:</strong> Provides primary data directly from the source. Can be structured (fixed questions) or unstructured (open-ended).",
    "wrong": "<strong>A)</strong> <em>A stacked chart</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>A bar chart</em> — This is a chart using rectangular bars to compare values across different categories. Horizontal bars are useful for long category labels. Vertical bars (column charts) emphasize change over time. It does not answer this question correctly.<br><strong>D)</strong> <em>A bubble chart</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "187": {
    "correct": "<strong>A)</strong> <strong>Launch year and region</strong> is the correct answer. <br><strong>Concept:</strong> a virtual table defined by a SQL query, stored as an object in the database. <br><strong>Why correct here:</strong> Does not store data itself; reflects the current data in the underlying tables when queried.",
    "wrong": "<strong>B)</strong> <em>Region and product</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Brand and sales</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Launch year and product</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "188": {
    "correct": "<strong>D)</strong> <strong>t-test</strong> is the correct answer. <br><strong>What it is:</strong> t-test is a statistical test that compares the means of one or two groups to determine if they differ significantly. <br><strong>Why correct here:</strong> Used when sample sizes are small or population standard deviation is unknown.",
    "wrong": "<strong>A)</strong> <em>p-value</em> — This is the probability of observing results at least as extreme as the data, assuming the null hypothesis is true. A p-value below the significance level (commonly 0.05) means the result is statistically significant — you reject the null hypothesis. It does not answer this question correctly.<br><strong>B)</strong> <em>Z-score</em> — This is the number of standard deviations a data point is from the mean. Formula: z = (x - mean) / SD. Used for standardizing data and comparing values across different scales. It does not answer this question correctly.<br><strong>C)</strong> <em>Chi-squared test</em> — This is a statistical test used to determine if there is a significant association between two categorical variables. Compares observed frequencies to expected frequencies under the null hypothesis. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "189": {
    "correct": "<strong>A)</strong> <strong>Display a column with historical unit numbers and new unit numbers.</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>B)</strong> <em>Create a new unit inventory with new unit numbers only.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Delete historical files with previous unit numbers.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Create a hidden column that shows the historical unit numbers.</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "190": {
    "correct": "<strong>D)</strong> <strong>Empty collection</strong> is the correct answer. <br><strong>Concept:</strong> numeric data with equal intervals AND a true zero point (e.g., height, weight, income). <br><strong>Why correct here:</strong> Both differences and ratios are meaningful — $100 is twice $50.",
    "wrong": "<strong>A)</strong> <em>Sum collection</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Data collection</em> — This is the process of gathering raw data from various sources for analysis. Methods: surveys, sensors, web scraping, APIs, manual entry, and automated data feeds. It does not answer this question correctly.<br><strong>C)</strong> <em>Average collection</em> — This is the arithmetic mean — sum of all values divided by the count. The most common measure of central tendency for symmetric datasets. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "191": {
    "correct": "<strong>A)</strong> <strong>A single report with the option to select the date range</strong> is the correct answer. <br><strong>What it is:</strong> A single report with the option to select the date range is the difference between the maximum and minimum values in a dataset. <br><strong>Why correct here:</strong> A simple but outlier-sensitive measure of spread.",
    "wrong": "<strong>B)</strong> <em>One consolidated report with all available data</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>C)</strong> <em>Automated reports to be distributed based on the time frames in the requirements</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>D)</strong> <em>The reports as requested in the requirements document</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "192": {
    "correct": "<strong>A)</strong> <strong>A one-time report</strong> is the correct answer. <br><strong>What it is:</strong> A one-time report is a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>B)</strong> <em>A recurring report</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>C)</strong> <em>A tactical report</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>D)</strong> <em>A monthly report</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "193": {
    "correct": "<strong>B)</strong> <strong>$241,500 to $367,500</strong> is the correct answer. <br><strong>Concept:</strong> the difference between the maximum and minimum values in a dataset. <br><strong>Why correct here:</strong> A simple but outlier-sensitive measure of spread.",
    "wrong": "<strong>A)</strong> <em>$103,500 to $157,500</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>$320,000 to $386,000</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>$345,000 to $525,000</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "194": {
    "correct": "<strong>D)</strong> <strong>star schema.</strong> is the correct answer. <br><strong>What it is:</strong> star schema. is the blueprint or structure of a database — defines tables, columns, data types, and relationships. <br><strong>Why correct here:</strong> A fixed schema (relational DB) enforces structure; a schema-less approach (NoSQL) allows flexible formats.",
    "wrong": "<strong>A)</strong> <em>non-relational schema.</em> — This is the blueprint or structure of a database — defines tables, columns, data types, and relationships. A fixed schema (relational DB) enforces structure; a schema-less approach (NoSQL) allows flexible formats. It does not answer this question correctly.<br><strong>B)</strong> <em>galaxy schema.</em> — This is the blueprint or structure of a database — defines tables, columns, data types, and relationships. A fixed schema (relational DB) enforces structure; a schema-less approach (NoSQL) allows flexible formats. It does not answer this question correctly.<br><strong>C)</strong> <em>snowflake schema.</em> — This is the blueprint or structure of a database — defines tables, columns, data types, and relationships. A fixed schema (relational DB) enforces structure; a schema-less approach (NoSQL) allows flexible formats. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "195": {
    "correct": "<strong>A)</strong> <strong>Application programming interface</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>B)</strong> <em>Public databases</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Survey</em> — This is a data collection method that gathers information from respondents through questions. Provides primary data directly from the source. Can be structured (fixed questions) or unstructured (open-ended). It does not answer this question correctly.<br><strong>D)</strong> <em>Web scraping</em> — This is Application Programming Interface — a set of rules and protocols that allows different software applications to communicate with each other. REST APIs use HTTP requests to GET, POST, PUT, and DELETE data in JSON or XML format. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "196": {
    "correct": "<strong>B)</strong> <strong>R</strong> is the correct answer. <br><strong>Concept:</strong> the value that appears most frequently in a dataset. <br><strong>Why correct here:</strong> Useful for categorical data or when you want to know the most common occurrence.",
    "wrong": "<strong>A)</strong> <em>Microsoft Power BI</em> — This is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. Tools include Tableau, Power BI, Looker, and QlikView. It does not answer this question correctly.<br><strong>C)</strong> <em>SQL</em> — This is Structured Query Language — the standard language for managing and querying relational databases. Core operations: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove), and DDL (define structure). It does not answer this question correctly.<br><strong>D)</strong> <em>Tableau</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "197": {
    "correct": "<strong>A)</strong> <strong>Correlation coefficient</strong> is the correct answer. <br><strong>What it is:</strong> Correlation coefficient is a number between -1 and +1 quantifying the strength and direction of a linear relationship between two variables. <br><strong>Why correct here:</strong> Close to +1 or -1 = strong relationship; close to 0 = weak or no linear relationship.",
    "wrong": "<strong>B)</strong> <em>Chi-squared test</em> — This is a statistical test used to determine if there is a significant association between two categorical variables. Compares observed frequencies to expected frequencies under the null hypothesis. It does not answer this question correctly.<br><strong>C)</strong> <em>Two-sample t-test</em> — This is a subset of a population selected to represent the whole. Sampling allows inference about a population without measuring every individual. It does not answer this question correctly.<br><strong>D)</strong> <em>Two-way ANOVA</em> — This is Analysis of Variance — a statistical test that compares means across three or more groups. Tests whether at least one group mean is different; follow-up tests identify which groups differ. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "198": {
    "correct": "<strong>D)</strong> <strong>Sampling</strong> is the correct answer. <br><strong>What it is:</strong> Sampling is selecting a subset of a population to estimate characteristics of the whole. <br><strong>Why correct here:</strong> Methods: random, stratified, cluster, systematic, and convenience sampling.",
    "wrong": "<strong>A)</strong> <em>Observation</em> — This is a data collection method where data is gathered by watching subjects in their natural environment. Minimizes the Hawthorne effect if subjects are unaware they are being observed. It does not answer this question correctly.<br><strong>B)</strong> <em>Delta load</em> — This is Extract, Load, Transform — a variation of ETL where raw data is loaded first and then transformed inside the target system. Made practical by cloud data warehouses (Snowflake, BigQuery) that can handle transformation at scale. It does not answer this question correctly.<br><strong>C)</strong> <em>Web scraping</em> — This is Application Programming Interface — a set of rules and protocols that allows different software applications to communicate with each other. REST APIs use HTTP requests to GET, POST, PUT, and DELETE data in JSON or XML format. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "199": {
    "correct": "<strong>B)</strong> <strong>Append</strong> is the correct answer. <br><strong>What it is:</strong> Append is adding new rows (records) to an existing dataset. <br><strong>Why correct here:</strong> Differs from joining, which adds new columns. Used when combining data from the same source over different time periods.",
    "wrong": "<strong>A)</strong> <em>Join</em> — This is a SQL operation that combines rows from two or more tables based on a related column. Types: INNER (matching rows only), LEFT/RIGHT OUTER (all rows from one side), FULL OUTER (all rows from both sides), CROSS (all combinations). It does not answer this question correctly.<br><strong>C)</strong> <em>Transform</em> — This is converting data from one format, structure, or value set to another. Includes type conversion, normalization, aggregation, and encoding. It does not answer this question correctly.<br><strong>D)</strong> <em>Blend</em> — This is combining data from multiple sources into a single analysis without fully integrating them into one database. Used in BI tools (e.g., Tableau) to join data from different connections on the fly. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "200": {
    "correct": "<strong>B)</strong> <strong>The frequency of the number of times each value occurs by using whole numbers</strong> is the correct answer. <br><strong>What it is:</strong> The frequency of the number of times each value occurs by using whole numbers is the count of how many times a value or category appears in a dataset. <br><strong>Why correct here:</strong> Relative frequency = count / total. Used in histograms and frequency tables.",
    "wrong": "<strong>A)</strong> <em>Non-numeric data used to describe attributes of a population sample</em> — This is a subset of a population selected to represent the whole. Sampling allows inference about a population without measuring every individual. It does not answer this question correctly.<br><strong>C)</strong> <em>Numeric values that can be measured on a continuous scale</em> — This is data that can take any value within a range (e.g., temperature, height, weight). Can be measured with arbitrary precision. Contrast with discrete data, which has countable values. It does not answer this question correctly.<br><strong>D)</strong> <em>Non-numeric data used to describe attributes of a population sample ranked in a specific order</em> — This is a subset of a population selected to represent the whole. Sampling allows inference about a population without measuring every individual. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "201": {
    "correct": "<strong>A)</strong> <strong>Data transmission</strong> is the correct answer. <br><strong>Concept:</strong> the set of policies, standards, and processes that ensure data is managed consistently and used responsibly across an organization. <br><strong>Why correct here:</strong> Includes defining data ownership, quality standards, access controls, and compliance requirements.",
    "wrong": "<strong>B)</strong> <em>Data deletion</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data use agreements</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Personally identifiable information</em> — This is PII (Personally Identifiable Information). Any data that can be used to identify a specific individual; protected by privacy laws. It does not answer this question correctly.",
    "domain": "Data Governance & Quality"
  },
  "202": {
    "correct": "<strong>B)</strong> <strong>Drill-down capability</strong> is the correct answer. <br><strong>What it is:</strong> Drill-down capability is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. <br><strong>Why correct here:</strong> Tools include Tableau, Power BI, Looker, and QlikView.",
    "wrong": "<strong>A)</strong> <em>Variable formatting</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Saved searches</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Access permissions</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "203": {
    "correct": "<strong>A)</strong> <strong>Glossary</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>B)</strong> <em>System diagram</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>User requirements</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Index</em> — This is a database structure that improves the speed of data retrieval operations on a table. Like a book's index — allows the database to find rows without scanning the entire table. It does not answer this question correctly.",
    "domain": "General Data Concepts"
  },
  "204": {
    "correct": "<strong>C)</strong> <strong>The report included the previous month's data.</strong> is the correct answer. <br><strong>What it is:</strong> The report included the previous month's data. is a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>A)</strong> <em>The data cleansing processes failed to execute.</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>The database connectivity failed.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>The data normalization processes failed.</em> — This is the process of organizing a database to reduce redundancy and improve data integrity. Higher normal forms (1NF, 2NF, 3NF, BCNF) eliminate different types of data anomalies. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "205": {
    "correct": "<strong>B)</strong> <strong>Data outliers</strong> is the correct answer. <br><strong>What it is:</strong> Data outliers is a data point that is significantly different from the rest of the dataset. <br><strong>Why correct here:</strong> Can distort the mean and standard deviation. Often handled by removing, capping, or transforming the value.",
    "wrong": "<strong>A)</strong> <em>Data completeness</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Duplicate data</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Missing values</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "206": {
    "correct": "<strong>B)</strong> <strong>Aggregation</strong> is the correct answer. <br><strong>What it is:</strong> Aggregation is the process of combining multiple data values into a single summary value (e.g., sum, count, average). <br><strong>Why correct here:</strong> Required for moving from row-level detail to summary metrics for reporting.",
    "wrong": "<strong>A)</strong> <em>Filtering</em> — This is selecting a subset of data that meets specified criteria. Example: selecting only customers from California, or transactions over $1,000. It does not answer this question correctly.<br><strong>C)</strong> <em>Sorting</em> — This is arranging data in ascending or descending order based on one or more columns. Fundamental data operation for ranking, display, and identifying extremes. It does not answer this question correctly.<br><strong>D)</strong> <em>Concatenation</em> — This is the operation of joining two or more strings end-to-end to form a new string. Example: combining first name and last name fields into a full name field. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "207": {
    "correct": "<strong>D)</strong> <strong>Categorical</strong> is the correct answer. <br><strong>Concept:</strong> a classification that specifies what kind of value a variable holds (e.g., integer, string, boolean, float). <br><strong>Why correct here:</strong> Determines what operations can be performed on the data and how much storage it requires.",
    "wrong": "<strong>A)</strong> <em>Discrete</em> — This is data that can only take specific, countable values (e.g., number of customers, number of defects). Cannot be meaningfully subdivided — you cannot have 2.5 customers. It does not answer this question correctly.<br><strong>B)</strong> <em>Numerical</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Alphanumeric</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "208": {
    "correct": "<strong>B)</strong> <strong>Merge</strong> is the correct answer. <br><strong>What it is:</strong> Merge is combining two or more datasets based on a common key or identifier. <br><strong>Why correct here:</strong> Equivalent to a SQL JOIN. Matches records from different datasets using a shared field.",
    "wrong": "<strong>A)</strong> <em>Blend</em> — This is combining data from multiple sources into a single analysis without fully integrating them into one database. Used in BI tools (e.g., Tableau) to join data from different connections on the fly. It does not answer this question correctly.<br><strong>C)</strong> <em>Append</em> — This is adding new rows (records) to an existing dataset. Differs from joining, which adds new columns. Used when combining data from the same source over different time periods. It does not answer this question correctly.<br><strong>D)</strong> <em>Aggregate</em> — This is a function that performs a calculation on a set of values and returns a single value. Examples: COUNT, SUM, AVG, MIN, MAX. Used with GROUP BY to calculate metrics per group. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "209": {
    "correct": "<strong>A)</strong> <strong>Int</strong> is the correct answer for this question about <em>Data Types & Structures</em>.",
    "wrong": "<strong>B)</strong> <em>Float</em> — This is a number with a decimal component (floating-point number). Used for measurements and calculations requiring precision beyond whole numbers. It does not answer this question correctly.<br><strong>C)</strong> <em>Char</em> — This is a chart using rectangular bars to compare values across different categories. Horizontal bars are useful for long category labels. Vertical bars (column charts) emphasize change over time. It does not answer this question correctly.<br><strong>D)</strong> <em>Double</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "210": {
    "correct": "<strong>B)</strong> <strong>Boolean</strong> is the correct answer. <br><strong>What it is:</strong> Boolean is a data type with only two possible values: true or false (or 1/0). <br><strong>Why correct here:</strong> Used in logic, filters, and conditional operations.",
    "wrong": "<strong>A)</strong> <em>Integer</em> — This is a whole number with no decimal component. Used for counts and discrete quantities. Operations include arithmetic. It does not answer this question correctly.<br><strong>C)</strong> <em>Categorical</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Numeric</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "211": {
    "correct": "<strong>B)</strong> <code>6</code> is the correct calculated answer. <br><em>Formula reminder:</em> Standard Deviation = √(Variance) = √[Σ(xᵢ - mean)² / N]",
    "wrong": "<strong>A)</strong> <em>.16</em> — incorrect calculation result. <strong>C)</strong> <em>36</em> — incorrect calculation result. <strong>D)</strong> <em>72</em> — incorrect calculation result.",
    "domain": "Data Analysis & Statistics"
  },
  "212": {
    "correct": "<strong>B)</strong> <strong>Chi-squared test</strong> is the correct answer. <br><strong>What it is:</strong> Chi-squared test is a statistical test used to determine if there is a significant association between two categorical variables. <br><strong>Why correct here:</strong> Compares observed frequencies to expected frequencies under the null hypothesis.",
    "wrong": "<strong>A)</strong> <em>t-test</em> — This is a statistical test that compares the means of one or two groups to determine if they differ significantly. Used when sample sizes are small or population standard deviation is unknown. It does not answer this question correctly.<br><strong>C)</strong> <em>Rank sum test</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Ratio test</em> — This is numeric data with equal intervals AND a true zero point (e.g., height, weight, income). Both differences and ratios are meaningful — $100 is twice $50. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "213": {
    "correct": "<strong>A)</strong> <strong>Aggregation</strong> is the correct answer. <br><strong>What it is:</strong> Aggregation is the process of combining multiple data values into a single summary value (e.g., sum, count, average). <br><strong>Why correct here:</strong> Required for moving from row-level detail to summary metrics for reporting.",
    "wrong": "<strong>B)</strong> <em>Sorting</em> — This is arranging data in ascending or descending order based on one or more columns. Fundamental data operation for ranking, display, and identifying extremes. It does not answer this question correctly.<br><strong>C)</strong> <em>Filtering</em> — This is selecting a subset of data that meets specified criteria. Example: selecting only customers from California, or transactions over $1,000. It does not answer this question correctly.<br><strong>D)</strong> <em>Indexing</em> — This is a database structure that improves the speed of data retrieval operations on a table. Like a book's index — allows the database to find rows without scanning the entire table. It does not answer this question correctly.<br><strong>E)</strong> <em>Cleaning</em> — This is the process of detecting and correcting errors, inconsistencies, and missing values in a dataset. Includes handling nulls, fixing formatting, removing duplicates, and resolving inconsistencies. It does not answer this question correctly.<br><strong>F)</strong> <em>Replacing</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "214": {
    "correct": "<strong>D)</strong> <strong>Transpose</strong> is the correct answer. <br><strong>Concept:</strong> Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. <br><strong>Why correct here:</strong> Tools include Tableau, Power BI, Looker, and QlikView.",
    "wrong": "<strong>A)</strong> <em>Blend</em> — This is combining data from multiple sources into a single analysis without fully integrating them into one database. Used in BI tools (e.g., Tableau) to join data from different connections on the fly. It does not answer this question correctly.<br><strong>B)</strong> <em>Merge</em> — This is combining two or more datasets based on a common key or identifier. Equivalent to a SQL JOIN. Matches records from different datasets using a shared field. It does not answer this question correctly.<br><strong>C)</strong> <em>Concatenate</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "215": {
    "correct": "<strong>A)</strong> <strong>Ruby</strong> is the correct answer for this question about <em>Analytics Tools</em>.",
    "wrong": "<strong>B)</strong> <em>Rust</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>PHP</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Python</em> — This is not the best answer for this scenario.<br><strong>E)</strong> <em>Katlin</em> — This is not the best answer for this scenario.<br><strong>F)</strong> <em>R</em> — This is not the best answer for this scenario.",
    "domain": "Analytics Tools"
  },
  "216": {
    "correct": "<strong>A)</strong> <strong>SSIS</strong> is the correct answer. <br><strong>Concept:</strong> Extract, Transform, Load — a data integration process that extracts data from sources, transforms it into the required format, and loads it into a target system. <br><strong>Why correct here:</strong> The standard pipeline for populating data warehouses. Transformation includes cleaning, deduplication, and enrichment.",
    "wrong": "<strong>B)</strong> <em>Stata</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>SPSS</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Cognos</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "217": {
    "correct": "<strong>C)</strong> <strong>Data retention</strong> is the correct answer. <br><strong>What it is:</strong> Data retention is the policies that define how long data should be stored before it is deleted or archived. <br><strong>Why correct here:</strong> Balances storage costs against regulatory requirements and business needs.",
    "wrong": "<strong>A)</strong> <em>Data deletion</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Data processing</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Data constraints</em> — This is not the best answer for this scenario.",
    "domain": "Data Governance & Quality"
  },
  "218": {
    "correct": "<strong>B)</strong> <strong>Trend analysis</strong> is the correct answer. <br><strong>What it is:</strong> Trend analysis is the long-term direction (increasing, decreasing, or flat) in a time series. <br><strong>Why correct here:</strong> Identified by removing seasonality and noise from the data.",
    "wrong": "<strong>A)</strong> <em>Correlation analysis</em> — This is a statistical measure of how strongly two variables move together, ranging from -1 to +1. Positive correlation: both increase together. Negative: one increases as the other decreases. 0 = no linear relationship. It does not answer this question correctly.<br><strong>C)</strong> <em>Regression analysis</em> — This is a supervised machine learning and statistical technique that predicts a continuous output variable based on input variables. Linear regression predicts a straight-line relationship; polynomial regression handles curves. It does not answer this question correctly.<br><strong>D)</strong> <em>Descriptive analysis</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "219": {
    "correct": "<strong>D)</strong> <strong>Accuracy</strong> is the correct answer. <br><strong>What it is:</strong> Accuracy is the proportion of correct predictions out of all predictions made by a classification model. <br><strong>Why correct here:</strong> Formula: (TP + TN) / (TP + TN + FP + FN). Can be misleading with imbalanced classes.",
    "wrong": "<strong>A)</strong> <em>Integrity</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Consistency</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Completeness</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "220": {
    "correct": "<strong>D)</strong> <strong>Line chart</strong> is the correct answer. <br><strong>What it is:</strong> Line chart is a chart that displays data points connected by lines to show trends over time. <br><strong>Why correct here:</strong> Best for continuous data and time series. Multiple lines allow comparison of trends across groups.",
    "wrong": "<strong>A)</strong> <em>Pie chart</em> — This is a circular chart divided into slices to show the proportion of each category as a percentage of the whole. Best limited to 5-6 categories. Difficult to compare similarly-sized slices — bar charts are often clearer. It does not answer this question correctly.<br><strong>B)</strong> <em>Scatter plot</em> — This is a chart that uses dots to show the relationship between two continuous variables. Used to identify correlation, clusters, and outliers. The x-axis is typically the independent variable. It does not answer this question correctly.<br><strong>C)</strong> <em>Heat map</em> — This is a visualization that uses color intensity to represent the value of a variable across a two-dimensional space. Used to show patterns, correlations, or geographic distributions. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "221": {
    "correct": "<strong>B) HAVING</strong> and <strong>C) WHERE</strong> are the correct answers. <br><strong>What they are:</strong> <code>WHERE</code> filters individual rows before aggregation, while <code>HAVING</code> filters grouped results after <code>GROUP BY</code> has been applied. <br><strong>Why correct here:</strong> Example <code>WHERE</code>: <code>SELECT * FROM orders WHERE amount &gt; 100;</code> returns only rows where the order amount is greater than 100. Example <code>HAVING</code>: <code>SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id HAVING COUNT(*) &gt; 5;</code> returns only customers with more than five orders.",
    "wrong": "<strong>A)</strong> <em>ORDER BY</em> — This sorts the result set but does not filter it. Example: <code>SELECT * FROM orders ORDER BY order_date DESC;</code> shows newest orders first, but it still returns all matching rows.<br><strong>D)</strong> <em>SELECT</em> — This specifies which columns to return, not which rows or groups to filter out. Example: <code>SELECT customer_id, amount FROM orders;</code> chooses columns but does not narrow the result set by itself.<br><strong>E)</strong> <em>INSERT</em> — This adds new rows to a table rather than filtering existing data. Example: <code>INSERT INTO orders (customer_id, amount) VALUES (101, 250);</code> creates a record instead of querying one.<br><strong>F)</strong> <em>GROUP BY</em> — This groups rows so aggregate calculations can be performed, but filtering those grouped results is done by <code>HAVING</code>. Example: <code>SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id;</code> creates groups, but it does not remove any group unless a <code>HAVING</code> clause is added.",
    "domain": "Databases & Data Concepts"
  },
  "222": {
    "correct": "<strong>D)</strong> <strong>Clustered index</strong> is the correct answer. <br><strong>What it is:</strong> Clustered index is a database structure that improves the speed of data retrieval operations on a table. <br><strong>Why correct here:</strong> Like a book's index — allows the database to find rows without scanning the entire table.",
    "wrong": "<strong>A)</strong> <em>Foreign key</em> — This is a column in one table that references the primary key of another table, establishing a relationship. Enforces referential integrity — you cannot have a foreign key value that does not exist in the referenced table. It does not answer this question correctly.<br><strong>B)</strong> <em>Function</em> — This is a function that performs a calculation on a set of values and returns a single value. Examples: COUNT, SUM, AVG, MIN, MAX. Used with GROUP BY to calculate metrics per group. It does not answer this question correctly.<br><strong>C)</strong> <em>Stored procedure</em> — This is a precompiled set of SQL statements stored in the database that can be executed as a single unit. Reduces network traffic and allows reusable business logic to live in the database. It does not answer this question correctly.",
    "domain": "General Data Concepts"
  },
  "223": {
    "correct": "<strong>A)</strong> <strong>Role-based</strong> is the correct answer. <br><strong>What it is:</strong> Role-based is a security model that restricts system access based on the user's role within an organization. <br><strong>Why correct here:</strong> Users inherit permissions from their assigned role, reducing the risk of over-privileged accounts.",
    "wrong": "<strong>B)</strong> <em>Rule-based</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Discretionary</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Group-based</em> — This is not the best answer for this scenario.",
    "domain": "Data Governance & Quality"
  },
  "224": {
    "correct": "<strong>C)</strong> <strong>Concatenate</strong> is the correct answer. <br><strong>Concept:</strong> Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. <br><strong>Why correct here:</strong> Tools include Tableau, Power BI, Looker, and QlikView.",
    "wrong": "<strong>A)</strong> <em>Transpose</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Blend</em> — This is combining data from multiple sources into a single analysis without fully integrating them into one database. Used in BI tools (e.g., Tableau) to join data from different connections on the fly. It does not answer this question correctly.<br><strong>D)</strong> <em>Merge</em> — This is combining two or more datasets based on a common key or identifier. Equivalent to a SQL JOIN. Matches records from different datasets using a shared field. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "225": {
    "correct": "<strong>D)</strong> <code>3</code> is the correct calculated answer. <br><em>Formula reminder:</em> Range = Maximum value − Minimum value",
    "wrong": "<strong>A)</strong> <em>9</em> — incorrect calculation result. <strong>B)</strong> <em>0</em> — incorrect calculation result. <strong>C)</strong> <em>2</em> — incorrect calculation result.",
    "domain": "General Data Concepts"
  },
  "226": {
    "correct": "<strong>B)</strong> <strong>Date range</strong> is the correct answer. <br><strong>What it is:</strong> Date range is the difference between the maximum and minimum values in a dataset. <br><strong>Why correct here:</strong> A simple but outlier-sensitive measure of spread.",
    "wrong": "<strong>A)</strong> <em>Drop-down menu</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Text field</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Frequency</em> — This is the count of how many times a value or category appears in a dataset. Relative frequency = count / total. Used in histograms and frequency tables. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "227": {
    "correct": "<strong>B)</strong> <strong>PCI</strong> is the correct answer. <br><strong>Concept:</strong> numeric data with equal intervals AND a true zero point (e.g., height, weight, income). <br><strong>Why correct here:</strong> Both differences and ratios are meaningful — $100 is twice $50.",
    "wrong": "<strong>A)</strong> <em>PII</em> — This is Personally Identifiable Information — any data that could be used to identify a specific individual. Examples: name, SSN, email, phone number, IP address, biometric data. Protected by laws like GDPR and HIPAA. It does not answer this question correctly.<br><strong>C)</strong> <em>PBI</em> — This is Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions. Tools include Tableau, Power BI, Looker, and QlikView. It does not answer this question correctly.<br><strong>D)</strong> <em>PHI</em> — This is not the best answer for this scenario.",
    "domain": "Data Governance & Quality"
  },
  "228": {
    "correct": "<strong>D)</strong> <strong>A geographic map</strong> is the correct answer. <br><strong>Concept:</strong> numeric data with equal intervals AND a true zero point (e.g., height, weight, income). <br><strong>Why correct here:</strong> Both differences and ratios are meaningful — $100 is twice $50.",
    "wrong": "<strong>A)</strong> <em>A stacked chart</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>A tree map</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>A waterfall chart</em> — This is a chart that shows how an initial value is affected by a series of positive and negative changes, leading to a final value. Commonly used in financial analysis to show profit/loss breakdowns. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "229": {
    "correct": "<strong>D)</strong> <strong>Report view</strong> is the correct answer. <br><strong>What it is:</strong> Report view is a virtual table defined by a SQL query, stored as an object in the database. <br><strong>Why correct here:</strong> Does not store data itself; reflects the current data in the underlying tables when queried.",
    "wrong": "<strong>A)</strong> <em>Date range</em> — This is the difference between the maximum and minimum values in a dataset. A simple but outlier-sensitive measure of spread. It does not answer this question correctly.<br><strong>B)</strong> <em>Distribution list</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Data content</em> — This is not the best answer for this scenario.",
    "domain": "Data Analysis & Statistics"
  },
  "230": {
    "correct": "<strong>B)</strong> <strong>A line chart</strong> is the correct answer. <br><strong>What it is:</strong> A line chart is a chart that displays data points connected by lines to show trends over time. <br><strong>Why correct here:</strong> Best for continuous data and time series. Multiple lines allow comparison of trends across groups.",
    "wrong": "<strong>A)</strong> <em>A bubble chart</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>A scatter plot</em> — This is a chart that uses dots to show the relationship between two continuous variables. Used to identify correlation, clusters, and outliers. The x-axis is typically the independent variable. It does not answer this question correctly.<br><strong>D)</strong> <em>An infographic</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "231": {
    "correct": "<strong>C)</strong> <strong>Merge all date columns and unify the format.</strong> is the correct answer. <br><strong>Concept:</strong> a SQL operation that combines rows from two or more tables based on a related column. <br><strong>Why correct here:</strong> Types: INNER (matching rows only), LEFT/RIGHT OUTER (all rows from one side), FULL OUTER (all rows from both sides), CROSS (all combinations).",
    "wrong": "<strong>A)</strong> <em>Append all date columns and parse the strings.</em> — This is a sequence of characters used to represent text. Stored in quotes; operations include concatenation, substring, length, and pattern matching. It does not answer this question correctly.<br><strong>B)</strong> <em>Impute all three date columns and then merge.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Separate the columns into a table and merge.</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "232": {
    "correct": "<strong>C)</strong> <strong>Customer_ID, Order_Date, Amount</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>A)</strong> <em>Customer_ID, Channel, Order_Date</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Customer_ID, Territory, Amount</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Customer_ID, Quantity, Amount</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "233": {
    "correct": "<strong>A)</strong> <strong>SQL</strong> is the correct answer. <br><strong>What it is:</strong> SQL is Structured Query Language — the standard language for managing and querying relational databases. <br><strong>Why correct here:</strong> Core operations: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove), and DDL (define structure).",
    "wrong": "<strong>B)</strong> <em>Excel</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>JSON</em> — This is JavaScript Object Notation — a lightweight, human-readable data format used for transmitting data between a server and web application. Uses key-value pairs and arrays. Widely used in REST APIs and NoSQL databases. It does not answer this question correctly.<br><strong>D)</strong> <em>NoSQL</em> — This is a category of databases that store data in non-tabular formats such as documents, key-value pairs, graphs, or wide columns. Designed for high scalability and flexibility. Examples: MongoDB (document), Redis (key-value), Cassandra (wide column). It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "234": {
    "correct": "<strong>D)</strong> <strong>ELT</strong> is the correct answer. <br><strong>What it is:</strong> ELT is Extract, Load, Transform — a variation of ETL where raw data is loaded first and then transformed inside the target system. <br><strong>Why correct here:</strong> Made practical by cloud data warehouses (Snowflake, BigQuery) that can handle transformation at scale.",
    "wrong": "<strong>A)</strong> <em>ETL</em> — This is Extract, Transform, Load — a data integration process that extracts data from sources, transforms it into the required format, and loads it into a target system. The standard pipeline for populating data warehouses. Transformation includes cleaning, deduplication, and enrichment. It does not answer this question correctly.<br><strong>B)</strong> <em>API</em> — This is Application Programming Interface — a set of rules and protocols that allows different software applications to communicate with each other. REST APIs use HTTP requests to GET, POST, PUT, and DELETE data in JSON or XML format. It does not answer this question correctly.<br><strong>C)</strong> <em>SQL</em> — This is Structured Query Language — the standard language for managing and querying relational databases. Core operations: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove), and DDL (define structure). It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "235": {
    "correct": "<strong>D)</strong> <strong>Cross-validation</strong> is the correct answer for this question about <em>Data Governance & Quality</em>.",
    "wrong": "<strong>A)</strong> <em>Standardization</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Parameterization</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Encryption</em> — This is the process of converting data into an unreadable format using an algorithm and a key, so only authorized parties can read it. At rest: encrypts stored data. In transit: encrypts data being transmitted (e.g., TLS/SSL). It does not answer this question correctly.",
    "domain": "Data Governance & Quality"
  },
  "236": {
    "correct": "<strong>C)</strong> <strong>Link analysis</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>A)</strong> <em>Trend analysis</em> — This is the long-term direction (increasing, decreasing, or flat) in a time series. Identified by removing seasonality and noise from the data. It does not answer this question correctly.<br><strong>B)</strong> <em>Performance analysis</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Exploratory data analysis</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "237": {
    "correct": "<strong>A)</strong> <strong>Neo4j</strong> is the correct answer. <br><strong>Concept:</strong> a database that organizes data into tables (relations) with rows and columns, linked by keys. <br><strong>Why correct here:</strong> Uses SQL for querying. Examples: MySQL, PostgreSQL, SQL Server, Oracle.",
    "wrong": "<strong>B)</strong> <em>SQLite</em> — This is Structured Query Language — the standard language for managing and querying relational databases. Core operations: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove), and DDL (define structure). It does not answer this question correctly.<br><strong>C)</strong> <em>MySQL</em> — This is Structured Query Language — the standard language for managing and querying relational databases. Core operations: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove), and DDL (define structure). It does not answer this question correctly.<br><strong>D)</strong> <em>PostgreSQL</em> — This is Structured Query Language — the standard language for managing and querying relational databases. Core operations: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove), and DDL (define structure). It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "238": {
    "correct": "<strong>C)</strong> <strong>To confirm important details before dashboard development begins</strong> is the correct answer. <br><strong>What it is:</strong> To confirm important details before dashboard development begins is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. <br><strong>Why correct here:</strong> Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights.",
    "wrong": "<strong>A)</strong> <em>To identify the dimensions and measures</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>To send to the client after deploying the dashboard to production</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.<br><strong>D)</strong> <em>To receive client approval for the final dashboard design</em> — This is a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring. Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights. It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "239": {
    "correct": "<strong>A)</strong> <strong>Descriptive statistics</strong> is the correct answer for this question about <em>Data Analysis & Statistics</em>.",
    "wrong": "<strong>B)</strong> <em>Basic projections</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Gap analysis</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Trend analysis</em> — This is the long-term direction (increasing, decreasing, or flat) in a time series. Identified by removing seasonality and noise from the data. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "240": {
    "correct": "<strong>B)</strong> <strong>Invalid data</strong> is the correct answer. <br><strong>Concept:</strong> Common Table Expression — a named temporary result set defined with the WITH clause, used within a single SQL query. <br><strong>Why correct here:</strong> Improves readability and allows recursive queries.",
    "wrong": "<strong>A)</strong> <em>Duplicate data</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Missing value</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Redundant data</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "241": {
    "correct": "<strong>B)</strong> <strong>Range</strong> is the correct answer. <br><strong>What it is:</strong> Range is the difference between the maximum and minimum values in a dataset. <br><strong>Why correct here:</strong> A simple but outlier-sensitive measure of spread.",
    "wrong": "<strong>A)</strong> <em>Average</em> — This is the arithmetic mean — sum of all values divided by the count. The most common measure of central tendency for symmetric datasets. It does not answer this question correctly.<br><strong>C)</strong> <em>Standard deviation</em> — This is the square root of the variance; measures the average distance of data points from the mean. The most widely used measure of spread. A low SD means data is clustered near the mean; a high SD means it is spread out. It does not answer this question correctly.<br><strong>D)</strong> <em>Median</em> — This is the middle value when data is sorted in order; the 50th percentile. Preferred over the mean when data is skewed or has outliers, because it is not affected by extreme values. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "242": {
    "correct": "<strong>A)</strong> <strong>Standardize the field names.</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>B)</strong> <em>Recode the data values.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Overwrite the field names in one of the tables.</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Edit the field names in the data dictionary.</em> — This is a repository that defines the meaning, format, and usage of data elements within a system. Helps ensure consistent understanding and use of data across teams. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "243": {
    "correct": "<strong>C)</strong> <strong>Outlying</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>A)</strong> <em>Duplicate</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Missing</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Invalid</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "244": {
    "correct": "<strong>B)</strong> <strong>Float</strong> is the correct answer. <br><strong>What it is:</strong> Float is a number with a decimal component (floating-point number). <br><strong>Why correct here:</strong> Used for measurements and calculations requiring precision beyond whole numbers.",
    "wrong": "<strong>A)</strong> <em>Text</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Alphanumeric</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Numeric</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "245": {
    "correct": "<strong>A)</strong> <strong>Trend analysis</strong> is the correct answer. <br><strong>What it is:</strong> Trend analysis is the long-term direction (increasing, decreasing, or flat) in a time series. <br><strong>Why correct here:</strong> Identified by removing seasonality and noise from the data.",
    "wrong": "<strong>B)</strong> <em>Exploratory analysis</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Prescriptive analysis</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Link analysis</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "246": {
    "correct": "<strong>A)</strong> <strong>A credit card number</strong> is the correct answer. <br><strong>Concept:</strong> data organized in a predefined format, typically rows and columns in a table or spreadsheet. <br><strong>Why correct here:</strong> Easy to store in relational databases and query with SQL. Examples: transaction records, survey responses.",
    "wrong": "<strong>B)</strong> <em>An email</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>A photo</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Social media correspondence</em> — This is not the best answer for this scenario.",
    "domain": "Data Types & Structures"
  },
  "247": {
    "correct": "<strong>A)</strong> <strong>Data sources and attributes</strong> is the correct answer. <br><strong>What it is:</strong> Data sources and attributes is any system, file, or location from which data is collected. <br><strong>Why correct here:</strong> Can be internal (CRM, ERP, databases) or external (APIs, web, government data).",
    "wrong": "<strong>B)</strong> <em>Frequently asked questions</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>A report from the data source</em> — This is a structured document presenting data, analysis, and findings to support decision-making. Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard. It does not answer this question correctly.<br><strong>D)</strong> <em>A comparison of data sets</em> — This is not the best answer for this scenario.",
    "domain": "Visualization & Reporting"
  },
  "248": {
    "correct": "<strong>B)</strong> <strong>Encryption</strong> is the correct answer. <br><strong>What it is:</strong> Encryption is the process of converting data into an unreadable format using an algorithm and a key, so only authorized parties can read it. <br><strong>Why correct here:</strong> At rest: encrypts stored data. In transit: encrypts data being transmitted (e.g., TLS/SSL).",
    "wrong": "<strong>A)</strong> <em>De-identification</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Masking</em> — This is the technique of replacing sensitive data with realistic but fictitious values to protect it while retaining its usability. Used in development and testing environments to prevent exposure of real PII or sensitive data. It does not answer this question correctly.<br><strong>D)</strong> <em>Anonymization</em> — This is the irreversible process of removing or modifying personally identifiable information so individuals cannot be identified. Unlike pseudonymization, anonymized data cannot be re-linked to a person. It does not answer this question correctly.",
    "domain": "Data Governance & Quality"
  },
  "249": {
    "correct": "<strong>A)</strong> <strong>Determine business needs, find data sources, validate the data, create a mock-up, and analyze the information.</strong> is the correct answer. <br><strong>What it is:</strong> Determine business needs, find data sources, validate the data, create a mock-up, and analyze the information. is any system, file, or location from which data is collected. <br><strong>Why correct here:</strong> Can be internal (CRM, ERP, databases) or external (APIs, web, government data).",
    "wrong": "<strong>B)</strong> <em>Find data sources, determine business needs, validate the data, create a mock-up, and analyze the information.</em> — This is any system, file, or location from which data is collected. Can be internal (CRM, ERP, databases) or external (APIs, web, government data). It does not answer this question correctly.<br><strong>C)</strong> <em>Create a mock-up, validate the data, analyze the information, determine business needs, and find data sources.</em> — This is any system, file, or location from which data is collected. Can be internal (CRM, ERP, databases) or external (APIs, web, government data). It does not answer this question correctly.<br><strong>D)</strong> <em>Validate the data, find data sources, analyze the information, and determine business needs.</em> — This is any system, file, or location from which data is collected. Can be internal (CRM, ERP, databases) or external (APIs, web, government data). It does not answer this question correctly.",
    "domain": "Visualization & Reporting"
  },
  "250": {
    "correct": "<strong>A)</strong> <strong>=IF(A1=2,\"no\",\"hat\")</strong> is the correct answer for this question about <em>General Data Concepts</em>.",
    "wrong": "<strong>B)</strong> <em>=IF(A1=2,\"no\",\"hat\")END</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>=IF(A1,\"no\",\"hat\")</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>=IF(A1=2,no,hat)</em> — This is not the best answer for this scenario.",
    "domain": "General Data Concepts"
  },
  "251": {
    "correct": "<strong>A)</strong> <strong>Data content</strong> is the correct answer. <br><strong>Concept:</strong> a structured document presenting data, analysis, and findings to support decision-making. <br><strong>Why correct here:</strong> Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard.",
    "wrong": "<strong>B)</strong> <em>Frequency</em> — This is the count of how many times a value or category appears in a dataset. Relative frequency = count / total. Used in histograms and frequency tables. It does not answer this question correctly.<br><strong>C)</strong> <em>Filtering</em> — This is selecting a subset of data that meets specified criteria. Example: selecting only customers from California, or transactions over $1,000. It does not answer this question correctly.<br><strong>D)</strong> <em>Views</em> — This is a virtual table defined by a SQL query, stored as an object in the database. Does not store data itself; reflects the current data in the underlying tables when queried. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "252": {
    "correct": "<strong>A)</strong> <strong>Government-issued ID</strong> is the correct answer. <br><strong>Concept:</strong> Personally Identifiable Information — any data that could be used to identify a specific individual. <br><strong>Why correct here:</strong> Examples: name, SSN, email, phone number, IP address, biometric data. Protected by laws like GDPR and HIPAA.",
    "wrong": "<strong>B)</strong> <em>Address</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Order ID</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Order date</em> — This is not the best answer for this scenario.<br><strong>E)</strong> <em>Customer ID</em> — This is not the best answer for this scenario.<br><strong>F)</strong> <em>Referral number</em> — This is not the best answer for this scenario.",
    "domain": "Data Governance & Quality"
  },
  "253": {
    "correct": "<strong>D)</strong> <strong>Create a column that concatenates the first name and last name in each table. Use CONCATENATE and LOOKUP to bring the address field into Table.</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>A)</strong> <em>Transpose the first name and last name in both tables. Use LOOKUP to pull the address field from Table 2 into Table.</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Use LOOKUP with the first name or last name to pull the address field from Table 2 into Table.</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Use the append formula in both tables for the first name and last name. Use LOOKUP to pull the address field from Table 2 into Table.</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "254": {
    "correct": "<strong>C)</strong> <strong>Graph</strong> is the correct answer for this question about <em>Data Analysis & Statistics</em>.",
    "wrong": "<strong>A)</strong> <em>Correlation</em> — This is a statistical measure of how strongly two variables move together, ranging from -1 to +1. Positive correlation: both increase together. Negative: one increases as the other decreases. 0 = no linear relationship. It does not answer this question correctly.<br><strong>B)</strong> <em>Descriptive</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Regression</em> — This is a statistical technique that models the relationship between a dependent variable and one or more independent variables. Linear regression fits a straight line; used for prediction. The output is a formula like y = mx + b. It does not answer this question correctly.",
    "domain": "Data Analysis & Statistics"
  },
  "255": {
    "correct": "<strong>B)</strong> <strong>Flat file</strong> is the correct answer for this question about <em>Data Mining & Manipulation</em>.",
    "wrong": "<strong>A)</strong> <em>NoSQL</em> — This is a category of databases that store data in non-tabular formats such as documents, key-value pairs, graphs, or wide columns. Designed for high scalability and flexibility. Examples: MongoDB (document), Redis (key-value), Cassandra (wide column). It does not answer this question correctly.<br><strong>C)</strong> <em>JSON</em> — This is JavaScript Object Notation — a lightweight, human-readable data format used for transmitting data between a server and web application. Uses key-value pairs and arrays. Widely used in REST APIs and NoSQL databases. It does not answer this question correctly.<br><strong>D)</strong> <em>Relational database</em> — This is a database that organizes data into tables (relations) with rows and columns, linked by keys. Uses SQL for querying. Examples: MySQL, PostgreSQL, SQL Server, Oracle. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "256": {
    "correct": "<strong>A)</strong> <strong>Filtering</strong> is the correct answer. <br><strong>What it is:</strong> Filtering is selecting a subset of data that meets specified criteria. <br><strong>Why correct here:</strong> Example: selecting only customers from California, or transactions over $1,000.",
    "wrong": "<strong>B)</strong> <em>Parametrization</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Sorting</em> — This is arranging data in ascending or descending order based on one or more columns. Fundamental data operation for ranking, display, and identifying extremes. It does not answer this question correctly.<br><strong>D)</strong> <em>Indexing</em> — This is a database structure that improves the speed of data retrieval operations on a table. Like a book's index — allows the database to find rows without scanning the entire table. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "257": {
    "correct": "<strong>C)</strong> <strong>Data append</strong> is the correct answer. <br><strong>What it is:</strong> Data append is adding new rows (records) to an existing dataset. <br><strong>Why correct here:</strong> Differs from joining, which adds new columns. Used when combining data from the same source over different time periods.",
    "wrong": "<strong>A)</strong> <em>Data transpose</em> — This is not the best answer for this scenario.<br><strong>B)</strong> <em>Data concatenation</em> — This is the operation of joining two or more strings end-to-end to form a new string. Example: combining first name and last name fields into a full name field. It does not answer this question correctly.<br><strong>D)</strong> <em>Data normalization</em> — This is the process of organizing a database to reduce redundancy and improve data integrity. Higher normal forms (1NF, 2NF, 3NF, BCNF) eliminate different types of data anomalies. It does not answer this question correctly.",
    "domain": "Data Mining & Manipulation"
  },
  "258": {
    "correct": "<strong>D)</strong> <strong>Data type validation</strong> is the correct answer. <br><strong>What it is:</strong> Data type validation is a classification that specifies what kind of value a variable holds (e.g., integer, string, boolean, float). <br><strong>Why correct here:</strong> Determines what operations can be performed on the data and how much storage it requires.",
    "wrong": "<strong>A)</strong> <em>Data outliers</em> — This is a data point that is significantly different from the rest of the dataset. Can distort the mean and standard deviation. Often handled by removing, capping, or transforming the value. It does not answer this question correctly.<br><strong>B)</strong> <em>Invalid data</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Duplicate data</em> — This is not the best answer for this scenario.",
    "domain": "Data Mining & Manipulation"
  },
  "259": {
    "correct": "<strong>A)</strong> <strong>Alphanumeric</strong> is the correct answer. <br><strong>Concept:</strong> a classification that specifies what kind of value a variable holds (e.g., integer, string, boolean, float). <br><strong>Why correct here:</strong> Determines what operations can be performed on the data and how much storage it requires.",
    "wrong": "<strong>B)</strong> <em>Symbolic</em> — This is not the best answer for this scenario.<br><strong>C)</strong> <em>Numeric</em> — This is not the best answer for this scenario.<br><strong>D)</strong> <em>Float</em> — This is a number with a decimal component (floating-point number). Used for measurements and calculations requiring precision beyond whole numbers. It does not answer this question correctly.<br><strong>E)</strong> <em>Boolean</em> — This is a data type with only two possible values: true or false (or 1/0). Used in logic, filters, and conditional operations. It does not answer this question correctly.<br><strong>F)</strong> <em>String</em> — This is a sequence of characters used to represent text. Stored in quotes; operations include concatenation, substring, length, and pattern matching. It does not answer this question correctly.",
    "domain": "Data Types & Structures"
  }
};
