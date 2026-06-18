import re, json, sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')

repo_root = Path(__file__).resolve().parents[1]
quiz_data_path = repo_root / 'content' / 'study-spa' / 'quiz_data.js'
explanations_path = repo_root / 'content' / 'study-spa' / 'explanations.js'

with quiz_data_path.open('r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'const QUIZ_BANK\s*=\s*(\[.*\]);', content, re.DOTALL)
if not match:
    print("ERROR: Could not find QUIZ_BANK"); sys.exit(1)
data = json.loads(match.group(1))

# ── Comprehensive Knowledge Base ──────────────────────────────────────────────
KB = {
    # Statistics & Math
    "mean": ("the arithmetic average of a dataset — sum of all values divided by the count", "Used to measure central tendency when data is roughly symmetric and has no extreme outliers."),
    "average": ("the arithmetic mean — sum of all values divided by the count", "The most common measure of central tendency for symmetric datasets."),
    "median": ("the middle value when data is sorted in order; the 50th percentile", "Preferred over the mean when data is skewed or has outliers, because it is not affected by extreme values."),
    "mode": ("the value that appears most frequently in a dataset", "Useful for categorical data or when you want to know the most common occurrence."),
    "range": ("the difference between the maximum and minimum values in a dataset", "A simple but outlier-sensitive measure of spread."),
    "variance": ("the average of the squared differences from the mean; measures how spread out data is", "Squaring removes negatives and amplifies large deviations, making it sensitive to outliers."),
    "standard deviation": ("the square root of the variance; measures the average distance of data points from the mean", "The most widely used measure of spread. A low SD means data is clustered near the mean; a high SD means it is spread out."),
    "std dev": ("the square root of the variance; measures the average distance of data points from the mean", "The most widely used measure of spread."),
    "normal distribution": ("a symmetric, bell-shaped probability distribution where most values cluster around the mean", "In a normal distribution, ~68% of values fall within 1 SD, ~95% within 2 SD, and ~99.7% within 3 SD of the mean."),
    "bell curve": ("a symmetric, bell-shaped curve representing a normal distribution", "Used to model many natural phenomena; mean = median = mode at the center."),
    "skewed": ("a distribution where data is not symmetric — it has a longer tail on one side", "Right-skewed (positive): tail goes right; mean > median. Left-skewed (negative): tail goes left; mean < median."),
    "outlier": ("a data point that is significantly different from the rest of the dataset", "Can distort the mean and standard deviation. Often handled by removing, capping, or transforming the value."),
    "percentile": ("the value below which a given percentage of data falls", "The 90th percentile means 90% of values are at or below that point."),
    "quartile": ("values that divide a dataset into four equal parts (Q1=25th, Q2=50th, Q3=75th percentile)", "Used in box plots. The interquartile range (IQR = Q3 - Q1) measures the middle 50% of data."),
    "interquartile range": ("the range of the middle 50% of data, calculated as Q3 minus Q1", "Resistant to outliers — a better measure of spread than range when data has extreme values."),
    "iqr": ("the interquartile range — Q3 minus Q1; the middle 50% of data", "Used to detect outliers: values below Q1 - 1.5×IQR or above Q3 + 1.5×IQR are typically flagged."),
    "correlation": ("a statistical measure of how strongly two variables move together, ranging from -1 to +1", "Positive correlation: both increase together. Negative: one increases as the other decreases. 0 = no linear relationship."),
    "correlation coefficient": ("a number between -1 and +1 quantifying the strength and direction of a linear relationship between two variables", "Close to +1 or -1 = strong relationship; close to 0 = weak or no linear relationship."),
    "regression": ("a statistical technique that models the relationship between a dependent variable and one or more independent variables", "Linear regression fits a straight line; used for prediction. The output is a formula like y = mx + b."),
    "linear regression": ("a model that fits a straight line to data to predict a continuous dependent variable from one or more independent variables", "Minimizes the sum of squared residuals (errors) to find the best-fit line."),
    "p-value": ("the probability of observing results at least as extreme as the data, assuming the null hypothesis is true", "A p-value below the significance level (commonly 0.05) means the result is statistically significant — you reject the null hypothesis."),
    "significance": ("a result is statistically significant when the probability it occurred by chance is below the threshold (alpha, often 0.05)", "Significance does not mean practical importance — a large sample can make trivial differences significant."),
    "hypothesis": ("a testable statement about a population parameter", "The null hypothesis (H0) assumes no effect; the alternative hypothesis (H1) assumes there is an effect."),
    "null hypothesis": ("the assumption that there is no effect or no difference between groups", "Rejected when the p-value falls below the significance level (alpha)."),
    "confidence interval": ("a range of values that likely contains the true population parameter with a given level of confidence (e.g., 95%)", "A 95% CI means that if you repeated the study 100 times, ~95 of the intervals would contain the true value."),
    "sample": ("a subset of a population selected to represent the whole", "Sampling allows inference about a population without measuring every individual."),
    "population": ("the complete set of all individuals or items of interest in a study", "Parameters (true values) describe populations; statistics describe samples."),
    "sampling bias": ("systematic error that occurs when the sample does not accurately represent the population", "Can lead to incorrect conclusions. Types include selection bias, survivorship bias, and non-response bias."),
    "z-score": ("the number of standard deviations a data point is from the mean", "Formula: z = (x - mean) / SD. Used for standardizing data and comparing values across different scales."),
    "t-test": ("a statistical test that compares the means of one or two groups to determine if they differ significantly", "Used when sample sizes are small or population standard deviation is unknown."),
    "chi-square": ("a statistical test used to determine if there is a significant association between two categorical variables", "Compares observed frequencies to expected frequencies under the null hypothesis."),
    "anova": ("Analysis of Variance — a statistical test that compares means across three or more groups", "Tests whether at least one group mean is different; follow-up tests identify which groups differ."),
    "continuous": ("data that can take any value within a range (e.g., temperature, height, weight)", "Can be measured with arbitrary precision. Contrast with discrete data, which has countable values."),
    "discrete": ("data that can only take specific, countable values (e.g., number of customers, number of defects)", "Cannot be meaningfully subdivided — you cannot have 2.5 customers."),
    "nominal": ("categorical data with no inherent order (e.g., colors, gender, country)", "Only equality/inequality can be assessed — no ranking or arithmetic is meaningful."),
    "ordinal": ("categorical data with a meaningful order but no consistent interval between values (e.g., satisfaction ratings: poor/fair/good)", "You can rank ordinal data but cannot calculate meaningful averages."),
    "interval": ("numeric data with equal intervals between values but no true zero (e.g., temperature in Celsius)", "Differences are meaningful but ratios are not — 20°C is not 'twice as hot' as 10°C."),
    "ratio": ("numeric data with equal intervals AND a true zero point (e.g., height, weight, income)", "Both differences and ratios are meaningful — $100 is twice $50."),
    "frequency": ("the count of how many times a value or category appears in a dataset", "Relative frequency = count / total. Used in histograms and frequency tables."),
    "probability": ("the likelihood of an event occurring, expressed as a number between 0 and 1", "P=0 means impossible; P=1 means certain. Calculated as favorable outcomes / total outcomes."),
    "expected value": ("the weighted average of all possible outcomes of a random variable, weighted by their probabilities", "Used in risk analysis and decision-making to find the average long-run result."),
    "time series": ("a sequence of data points recorded at successive, equally spaced time intervals", "Used to analyze trends, seasonality, and cycles over time."),
    "trend": ("the long-term direction (increasing, decreasing, or flat) in a time series", "Identified by removing seasonality and noise from the data."),
    "seasonality": ("recurring patterns in data that repeat at regular intervals (e.g., holiday sales spikes each December)", "Must be accounted for when making comparisons across different time periods."),
    "moving average": ("a technique that smooths time-series data by averaging consecutive windows of data points", "Reduces noise to reveal the underlying trend."),
    "forecasting": ("using historical data and statistical models to predict future values", "Common methods: exponential smoothing, ARIMA, regression, and machine learning models."),
    "extrapolation": ("predicting values beyond the range of the observed data", "Risky — assumes the same pattern continues, which may not be true."),
    "interpolation": ("estimating values within the range of observed data points", "More reliable than extrapolation since it stays within known data boundaries."),

    # Data Types & Structures
    "structured data": ("data organized in a predefined format, typically rows and columns in a table or spreadsheet", "Easy to store in relational databases and query with SQL. Examples: transaction records, survey responses."),
    "unstructured data": ("data that does not follow a predefined format (e.g., emails, images, audio, social media posts)", "Requires special processing tools like NLP or computer vision to analyze."),
    "semi-structured data": ("data that does not fit neatly into tables but contains tags or markers to separate elements (e.g., JSON, XML, CSV)", "More flexible than structured data; can be parsed into a structure when needed."),
    "metadata": ("data that describes other data — such as file name, size, creation date, author, and format", "Helps in data governance, search, and understanding the context of datasets."),
    "data type": ("a classification that specifies what kind of value a variable holds (e.g., integer, string, boolean, float)", "Determines what operations can be performed on the data and how much storage it requires."),
    "boolean": ("a data type with only two possible values: true or false (or 1/0)", "Used in logic, filters, and conditional operations."),
    "string": ("a sequence of characters used to represent text", "Stored in quotes; operations include concatenation, substring, length, and pattern matching."),
    "integer": ("a whole number with no decimal component", "Used for counts and discrete quantities. Operations include arithmetic."),
    "float": ("a number with a decimal component (floating-point number)", "Used for measurements and calculations requiring precision beyond whole numbers."),
    "primary key": ("a column (or combination of columns) in a table that uniquely identifies each row", "Cannot contain NULL values and must be unique across all rows."),
    "foreign key": ("a column in one table that references the primary key of another table, establishing a relationship", "Enforces referential integrity — you cannot have a foreign key value that does not exist in the referenced table."),
    "relational database": ("a database that organizes data into tables (relations) with rows and columns, linked by keys", "Uses SQL for querying. Examples: MySQL, PostgreSQL, SQL Server, Oracle."),
    "nosql": ("a category of databases that store data in non-tabular formats such as documents, key-value pairs, graphs, or wide columns", "Designed for high scalability and flexibility. Examples: MongoDB (document), Redis (key-value), Cassandra (wide column)."),
    "data warehouse": ("a centralized repository designed for storing large volumes of historical, structured data for analytical reporting and business intelligence", "Data is integrated from multiple sources and optimized for read-heavy analytical queries, not real-time transactions."),
    "data lake": ("a storage repository that holds vast amounts of raw data in its native format until needed", "Supports structured, semi-structured, and unstructured data. More flexible but requires strong governance to avoid becoming a 'data swamp'."),
    "data mart": ("a subset of a data warehouse focused on a specific business area (e.g., sales, finance)", "Smaller and more focused than a full data warehouse; faster to query for specific departments."),
    "olap": ("Online Analytical Processing — a category of database technology optimized for complex analytical queries and multidimensional analysis", "Supports fast aggregation across large datasets using cube structures."),
    "oltp": ("Online Transaction Processing — systems designed to manage high volumes of short, atomic transactions in real time", "Examples: point-of-sale systems, online banking. Optimized for inserts, updates, and deletes."),
    "etl": ("Extract, Transform, Load — a data integration process that extracts data from sources, transforms it into the required format, and loads it into a target system", "The standard pipeline for populating data warehouses. Transformation includes cleaning, deduplication, and enrichment."),
    "elt": ("Extract, Load, Transform — a variation of ETL where raw data is loaded first and then transformed inside the target system", "Made practical by cloud data warehouses (Snowflake, BigQuery) that can handle transformation at scale."),
    "data pipeline": ("an automated workflow that moves and transforms data from source systems to destination systems", "Includes steps like extraction, validation, transformation, and loading."),
    "schema": ("the blueprint or structure of a database — defines tables, columns, data types, and relationships", "A fixed schema (relational DB) enforces structure; a schema-less approach (NoSQL) allows flexible formats."),
    "star schema": ("a data warehouse design with a central fact table surrounded by dimension tables", "Simple and fast for analytical queries. The fact table holds measurements; dimension tables hold descriptive attributes."),
    "snowflake schema": ("a variation of the star schema where dimension tables are normalized into multiple related tables", "Reduces data redundancy but requires more complex joins than a star schema."),
    "fact table": ("a central table in a star/snowflake schema that contains quantitative metrics (facts) and foreign keys to dimension tables", "Examples of facts: sales amount, quantity sold, number of visits."),
    "dimension table": ("a table in a star/snowflake schema that contains descriptive attributes (dimensions) related to the facts", "Examples: date, product, customer, location."),
    "index": ("a database structure that improves the speed of data retrieval operations on a table", "Like a book's index — allows the database to find rows without scanning the entire table."),
    "view": ("a virtual table defined by a SQL query, stored as an object in the database", "Does not store data itself; reflects the current data in the underlying tables when queried."),
    "stored procedure": ("a precompiled set of SQL statements stored in the database that can be executed as a single unit", "Reduces network traffic and allows reusable business logic to live in the database."),
    "trigger": ("a stored procedure that automatically executes in response to a specific event on a table (INSERT, UPDATE, DELETE)", "Used to enforce business rules, maintain audit logs, or cascade changes."),
    "normalization": ("the process of organizing a database to reduce redundancy and improve data integrity", "Higher normal forms (1NF, 2NF, 3NF, BCNF) eliminate different types of data anomalies."),
    "denormalization": ("intentionally introducing redundancy into a database to improve query read performance", "Common in data warehouses where reads far outnumber writes."),
    "join": ("a SQL operation that combines rows from two or more tables based on a related column", "Types: INNER (matching rows only), LEFT/RIGHT OUTER (all rows from one side), FULL OUTER (all rows from both sides), CROSS (all combinations)."),
    "inner join": ("returns only the rows where there is a match in both tables", "The most common join type; excludes rows with no match in either table."),
    "left join": ("returns all rows from the left table and matching rows from the right table; NULLs where there is no match", "Also called a LEFT OUTER JOIN. Useful when you want all records from the primary table."),
    "aggregate function": ("a function that performs a calculation on a set of values and returns a single value", "Examples: COUNT, SUM, AVG, MIN, MAX. Used with GROUP BY to calculate metrics per group."),
    "group by": ("a SQL clause that groups rows sharing the same value in specified columns so aggregate functions can be applied per group", "Always paired with aggregate functions like COUNT, SUM, or AVG."),
    "having": ("a SQL clause that filters groups after GROUP BY has been applied", "Like WHERE but applied to aggregated results. Used because WHERE cannot filter on aggregate functions."),
    "subquery": ("a query nested inside another SQL query", "Can appear in SELECT, FROM, or WHERE clauses. Used to filter, compute, or replace a table expression."),
    "cte": ("Common Table Expression — a named temporary result set defined with the WITH clause, used within a single SQL query", "Improves readability and allows recursive queries."),
    "window function": ("a SQL function that performs a calculation across a set of rows related to the current row, without collapsing them into a single result", "Examples: ROW_NUMBER(), RANK(), SUM() OVER(), AVG() OVER(). Retains individual row detail while adding aggregate context."),
    "null": ("a special marker in SQL indicating that a value is missing, unknown, or not applicable", "NULL is not the same as zero or an empty string. Use IS NULL / IS NOT NULL to test for it."),
    "deduplication": ("the process of identifying and removing duplicate records from a dataset", "Critical for data quality. Can be done using SQL (DISTINCT, ROW_NUMBER()) or ETL tools."),
    "data cleaning": ("the process of detecting and correcting errors, inconsistencies, and missing values in a dataset", "Includes handling nulls, fixing formatting, removing duplicates, and resolving inconsistencies."),
    "data wrangling": ("the process of transforming and mapping raw data into a format suitable for analysis", "Also called data munging. Includes cleaning, restructuring, and enriching data."),
    "imputation": ("the process of replacing missing values with substituted values (e.g., mean, median, or a predicted value)", "Preserves dataset size but introduces bias if not done carefully."),
    "data profiling": ("the process of examining a dataset to understand its structure, content, quality, and statistics", "Identifies nulls, duplicates, value distributions, and format inconsistencies."),
    "data lineage": ("the tracking of data's origin, movement, and transformation through a system over time", "Critical for debugging, compliance, and understanding how data was derived."),
    "data catalog": ("a metadata management tool that helps users discover, understand, and govern data assets", "Acts as an inventory of all data assets with descriptions, owners, and quality information."),
    "data dictionary": ("a repository that defines the meaning, format, and usage of data elements within a system", "Helps ensure consistent understanding and use of data across teams."),

    # Data Governance & Security
    "data governance": ("the set of policies, standards, and processes that ensure data is managed consistently and used responsibly across an organization", "Includes defining data ownership, quality standards, access controls, and compliance requirements."),
    "data quality": ("the degree to which data is accurate, complete, consistent, timely, and fit for its intended purpose", "Dimensions include accuracy, completeness, consistency, timeliness, validity, and uniqueness."),
    "data steward": ("a person responsible for managing and overseeing the use of data assets within an organization", "Ensures data quality, enforces data governance policies, and serves as subject-matter expert for specific data domains."),
    "data owner": ("the individual or team accountable for a specific dataset, including its access, quality, and appropriate use", "Has authority to grant access and set policies for the data they own."),
    "master data management": ("the processes and tools used to create and maintain a single, authoritative source of key business data (e.g., customers, products)", "Prevents inconsistent records across systems by establishing a 'golden record'."),
    "mdm": ("Master Data Management — the creation and maintenance of a single authoritative source of key business entities", "Ensures consistency of critical data like customer, product, and vendor records across systems."),
    "data masking": ("the technique of replacing sensitive data with realistic but fictitious values to protect it while retaining its usability", "Used in development and testing environments to prevent exposure of real PII or sensitive data."),
    "data anonymization": ("the irreversible process of removing or modifying personally identifiable information so individuals cannot be identified", "Unlike pseudonymization, anonymized data cannot be re-linked to a person."),
    "pseudonymization": ("replacing identifying fields in data with artificial identifiers (pseudonyms) so the data cannot be attributed to a specific individual without additional information", "The additional key is stored separately. Unlike anonymization, it is reversible."),
    "pii": ("Personally Identifiable Information — any data that could be used to identify a specific individual", "Examples: name, SSN, email, phone number, IP address, biometric data. Protected by laws like GDPR and HIPAA."),
    "gdpr": ("General Data Protection Regulation — a European Union law governing the collection and processing of personal data of EU residents", "Requires consent, data minimization, breach notification, and the right to be forgotten."),
    "hipaa": ("Health Insurance Portability and Accountability Act — a US law that protects the privacy and security of health information", "Covered entities must safeguard Protected Health Information (PHI) and report breaches."),
    "data encryption": ("the process of converting data into an unreadable format using an algorithm and a key, so only authorized parties can read it", "At rest: encrypts stored data. In transit: encrypts data being transmitted (e.g., TLS/SSL)."),
    "role-based access control": ("a security model that restricts system access based on the user's role within an organization", "Users inherit permissions from their assigned role, reducing the risk of over-privileged accounts."),
    "rbac": ("Role-Based Access Control — access permissions are assigned to roles, and users are assigned to roles", "Simplifies permission management in large organizations."),
    "data retention": ("the policies that define how long data should be stored before it is deleted or archived", "Balances storage costs against regulatory requirements and business needs."),
    "data classification": ("the process of categorizing data based on its sensitivity and the impact of its unauthorized disclosure", "Common levels: Public, Internal, Confidential, Restricted. Determines access controls and handling procedures."),
    "audit trail": ("a sequential, chronological record of system activities that allows reconstruction and examination of events", "Used for security investigations, compliance verification, and debugging."),
    "chain of custody": ("the chronological documentation of who has had possession of evidence or data and any changes made to it", "Critical in legal proceedings and forensic investigations to prove data integrity."),
    "data breach": ("an incident where unauthorized individuals access, steal, or expose sensitive data", "Requires notification to affected parties and regulators under laws like GDPR and HIPAA."),

    # Business Intelligence & Visualization
    "kpi": ("Key Performance Indicator — a measurable value that demonstrates how effectively a company is achieving key business objectives", "Examples: monthly revenue, customer churn rate, Net Promoter Score. Good KPIs are SMART: Specific, Measurable, Achievable, Relevant, Time-bound."),
    "key performance indicator": ("a quantifiable metric used to evaluate success in meeting objectives", "Should be tied directly to business goals and reviewed regularly."),
    "dashboard": ("a visual display that consolidates key metrics and KPIs in a single screen for at-a-glance monitoring", "Designed for quick decision-making; effective dashboards avoid clutter and highlight actionable insights."),
    "report": ("a structured document presenting data, analysis, and findings to support decision-making", "Can be static (point-in-time) or dynamic (interactive). More detailed than a dashboard."),
    "ad hoc": ("performed or created for a specific purpose on an as-needed basis, not planned in advance", "Ad hoc queries are one-time SQL queries written to answer a specific question, unlike scheduled reports."),
    "business intelligence": ("the technologies and practices for collecting, integrating, analyzing, and presenting business information to support better decision-making", "Includes reporting, dashboards, OLAP, and data mining."),
    "bi": ("Business Intelligence — technologies and processes that turn raw data into meaningful insights for business decisions", "Tools include Tableau, Power BI, Looker, and QlikView."),
    "data storytelling": ("the practice of combining data, visualizations, and narrative to communicate insights effectively to an audience", "Focuses on why data matters and what action should be taken, not just what the data shows."),
    "bar chart": ("a chart using rectangular bars to compare values across different categories", "Horizontal bars are useful for long category labels. Vertical bars (column charts) emphasize change over time."),
    "line chart": ("a chart that displays data points connected by lines to show trends over time", "Best for continuous data and time series. Multiple lines allow comparison of trends across groups."),
    "pie chart": ("a circular chart divided into slices to show the proportion of each category as a percentage of the whole", "Best limited to 5-6 categories. Difficult to compare similarly-sized slices — bar charts are often clearer."),
    "scatter plot": ("a chart that uses dots to show the relationship between two continuous variables", "Used to identify correlation, clusters, and outliers. The x-axis is typically the independent variable."),
    "histogram": ("a chart that shows the frequency distribution of a continuous variable by dividing it into bins", "Unlike bar charts, bins are contiguous. The shape reveals whether data is normally distributed, skewed, or bimodal."),
    "heat map": ("a visualization that uses color intensity to represent the value of a variable across a two-dimensional space", "Used to show patterns, correlations, or geographic distributions."),
    "box plot": ("a chart that displays the distribution of data through quartiles (Q1, median, Q3) and whiskers showing the range, with outliers plotted individually", "Also called a box-and-whisker plot. Useful for comparing distributions across groups."),
    "treemap": ("a visualization that displays hierarchical data as nested rectangles, where size represents a quantitative value", "Effective for showing part-to-whole relationships within hierarchical categories."),
    "waterfall chart": ("a chart that shows how an initial value is affected by a series of positive and negative changes, leading to a final value", "Commonly used in financial analysis to show profit/loss breakdowns."),
    "gantt chart": ("a bar chart that shows a project schedule with tasks plotted along a time axis", "Displays task duration, start/end dates, and dependencies. Standard in project management."),
    "funnel chart": ("a chart shaped like a funnel that shows the progressive reduction of data as it passes through stages of a process", "Commonly used for sales pipelines, conversion rates, and user journey analysis."),
    "drill down": ("the ability to navigate from a high-level summary to increasingly detailed data", "Example: clicking on a bar in an annual report to see quarterly, then monthly details."),
    "drill through": ("navigating from a summary report to a different, more detailed report about a specific data point", "Unlike drill-down, drill-through opens a separate report rather than expanding in place."),
    "slice and dice": ("the ability to view a dataset from multiple different perspectives by filtering and grouping dimensions", "Common in OLAP tools. 'Slicing' filters one dimension; 'dicing' filters multiple dimensions simultaneously."),
    "pivot table": ("a data summarization tool that dynamically reorganizes and aggregates data by selected dimensions and measures", "Allows users to rotate rows and columns to explore data from different angles."),
    "aggregation": ("the process of combining multiple data values into a single summary value (e.g., sum, count, average)", "Required for moving from row-level detail to summary metrics for reporting."),
    "granularity": ("the level of detail at which data is stored or reported", "High granularity = more detail (e.g., individual transactions). Low granularity = more summarized (e.g., daily totals)."),
    "data blending": ("combining data from multiple sources into a single analysis without fully integrating them into one database", "Used in BI tools (e.g., Tableau) to join data from different connections on the fly."),
    "calculated field": ("a new field created by applying a formula or transformation to existing fields", "Allows analysts to derive new metrics (e.g., profit margin = (revenue - cost) / revenue) without modifying source data."),
    "benchmark": ("a standard or reference point used to compare performance or quality", "Can be industry averages, historical performance, or goals set by the organization."),

    # Machine Learning & Analytics
    "machine learning": ("a branch of artificial intelligence in which systems learn from data to improve performance on a task without being explicitly programmed", "Types: supervised (labeled data), unsupervised (unlabeled), and reinforcement learning."),
    "supervised learning": ("a machine learning approach where the model is trained on labeled data (input-output pairs)", "Examples: classification (predict category) and regression (predict number). Labels are provided during training."),
    "unsupervised learning": ("a machine learning approach where the model finds patterns in unlabeled data without predefined outputs", "Examples: clustering (group similar items) and dimensionality reduction (PCA)."),
    "clustering": ("an unsupervised machine learning technique that groups similar data points together based on their features", "K-means assigns points to K clusters by minimizing distance to cluster centroids."),
    "classification": ("a supervised machine learning task that predicts which category a data point belongs to", "Examples: spam/not-spam, fraud/not-fraud, disease/no-disease. Outputs a discrete label."),
    "regression analysis": ("a supervised machine learning and statistical technique that predicts a continuous output variable based on input variables", "Linear regression predicts a straight-line relationship; polynomial regression handles curves."),
    "decision tree": ("a tree-shaped model that makes predictions by following a series of decision rules based on feature values", "Highly interpretable. Prone to overfitting on training data."),
    "random forest": ("an ensemble of decision trees that combines their predictions, typically by voting (classification) or averaging (regression)", "Reduces overfitting and improves accuracy over a single tree."),
    "neural network": ("a computational model inspired by the brain, consisting of layers of interconnected nodes (neurons) that learn patterns from data", "Used in deep learning. Excels at image recognition, NLP, and complex pattern recognition."),
    "overfitting": ("when a model learns the training data too well, including noise, and fails to generalize to new data", "Signs: high training accuracy, low test accuracy. Fixed by regularization, pruning, or using more training data."),
    "underfitting": ("when a model is too simple to capture the underlying patterns in the data", "Signs: poor performance on both training and test data. Fixed by using a more complex model or more features."),
    "training data": ("the labeled dataset used to teach a machine learning model", "Should be representative of the real-world data the model will encounter."),
    "test data": ("a separate dataset used to evaluate a trained model's performance on unseen data", "Never used during training — simulates real-world prediction scenarios."),
    "cross validation": ("a technique that splits data into multiple folds to evaluate model performance more robustly", "K-fold CV trains on K-1 folds and tests on the remaining fold, repeating K times."),
    "feature": ("an individual measurable property or characteristic of a data point used as input to a model", "Also called a variable or attribute. Feature engineering creates or selects the most useful features."),
    "feature engineering": ("the process of creating or transforming features to improve model performance", "Examples: binning, log transformation, creating interaction terms, encoding categorical variables."),
    "dimensionality reduction": ("the process of reducing the number of features in a dataset while retaining as much information as possible", "PCA (Principal Component Analysis) is the most common technique."),
    "pca": ("Principal Component Analysis — a dimensionality reduction technique that transforms features into orthogonal principal components ranked by variance explained", "Used to reduce noise, speed up training, and visualize high-dimensional data."),
    "natural language processing": ("a field of AI that enables computers to understand, interpret, and generate human language", "Used in sentiment analysis, chatbots, translation, and text classification."),
    "nlp": ("Natural Language Processing — enabling computers to understand, interpret, and generate human language", "Common tasks: tokenization, named entity recognition, sentiment analysis, and topic modeling."),
    "sentiment analysis": ("the use of NLP to identify and extract subjective information (positive, negative, neutral) from text", "Applied to customer reviews, social media, and survey responses."),
    "anomaly detection": ("the identification of data points, events, or observations that deviate significantly from the expected pattern", "Used in fraud detection, network security, and quality control."),
    "recommendation system": ("a system that predicts user preferences and suggests items (e.g., products, movies) based on behavior or similarity to other users", "Types: collaborative filtering (user behavior) and content-based filtering (item features)."),
    "a/b testing": ("a controlled experiment that compares two versions of something (A and B) to determine which performs better", "Randomly assigns users to each version and measures a defined outcome metric."),
    "model accuracy": ("the proportion of correct predictions out of all predictions made by a classification model", "Formula: (TP + TN) / (TP + TN + FP + FN). Can be misleading with imbalanced classes."),
    "precision": ("the proportion of positive predictions that are actually correct: TP / (TP + FP)", "High precision = few false positives. Important when the cost of false positives is high (e.g., spam detection)."),
    "recall": ("the proportion of actual positives correctly identified: TP / (TP + FN)", "Also called sensitivity or true positive rate. High recall = few false negatives."),
    "f1 score": ("the harmonic mean of precision and recall, balancing both metrics into a single score", "Best when you need to balance precision and recall, especially with imbalanced datasets."),
    "confusion matrix": ("a table showing the counts of true positives, true negatives, false positives, and false negatives for a classification model", "Used to evaluate the performance and types of errors made by a classifier."),
    "roc curve": ("Receiver Operating Characteristic curve — a graph showing the tradeoff between true positive rate and false positive rate at various thresholds", "Area Under the Curve (AUC) closer to 1 indicates a better model."),

    # Cloud & Infrastructure
    "cloud computing": ("the delivery of computing services (servers, storage, databases, networking, software) over the internet on demand", "Benefits: scalability, pay-per-use, no hardware management. Providers: AWS, Azure, Google Cloud."),
    "aws": ("Amazon Web Services — a comprehensive cloud computing platform offering 200+ services including compute, storage, databases, and machine learning", "Market leader in cloud services; key data services include S3, Redshift, Glue, and Athena."),
    "azure": ("Microsoft Azure — a cloud computing platform offering services for compute, analytics, storage, and networking", "Strong integration with Microsoft products (Office 365, Power BI, SQL Server)."),
    "saas": ("Software as a Service — software delivered over the internet and accessed via a browser, not installed locally", "Examples: Salesforce, Google Workspace, Slack. Provider manages infrastructure and updates."),
    "paas": ("Platform as a Service — a cloud model that provides a platform for developers to build, run, and manage applications without managing the underlying infrastructure", "Examples: Heroku, Google App Engine."),
    "iaas": ("Infrastructure as a Service — cloud model providing virtualized computing resources (servers, storage, networking) over the internet", "Examples: AWS EC2, Azure VMs. User manages OS and applications; provider manages hardware."),
    "api": ("Application Programming Interface — a set of rules and protocols that allows different software applications to communicate with each other", "REST APIs use HTTP requests to GET, POST, PUT, and DELETE data in JSON or XML format."),
    "rest api": ("Representational State Transfer API — an architectural style for APIs that uses standard HTTP methods and is stateless", "Resources are identified by URLs. Data is typically exchanged in JSON format."),
    "json": ("JavaScript Object Notation — a lightweight, human-readable data format used for transmitting data between a server and web application", "Uses key-value pairs and arrays. Widely used in REST APIs and NoSQL databases."),
    "xml": ("Extensible Markup Language — a text format that uses tags to define the structure of data", "More verbose than JSON. Still widely used in legacy enterprise systems and configuration files."),
    "csv": ("Comma-Separated Values — a plain text format for storing tabular data with each row on a new line and columns separated by commas", "Simple, widely supported, but lacks support for data types and complex structures."),
    "parquet": ("a columnar storage file format optimized for analytical workloads", "Stores data by column rather than row, allowing efficient compression and fast reads of specific columns."),
    "data compression": ("the process of reducing the size of data files to save storage space and speed up transmission", "Lossless compression (ZIP, gzip) recovers exact original data; lossy (JPEG, MP3) discards some data."),

    # Project & Process
    "agile": ("an iterative project management approach that delivers work in short cycles (sprints) and adapts to changing requirements", "Emphasizes collaboration, customer feedback, and incremental delivery over rigid planning."),
    "sprint": ("a fixed-length development cycle (typically 1-4 weeks) in Agile methodology", "At the end of each sprint, a potentially shippable product increment is delivered."),
    "waterfall": ("a linear, sequential project management approach where each phase must be completed before the next begins", "Phases: requirements → design → development → testing → deployment → maintenance."),
    "scrum": ("an Agile framework that organizes work into sprints with defined roles (Product Owner, Scrum Master, Development Team)", "Uses ceremonies: daily standups, sprint planning, sprint review, and retrospectives."),
    "data driven": ("making decisions based on data analysis and interpretation rather than intuition alone", "Requires reliable data, proper analysis, and a culture that trusts and acts on data insights."),
    "root cause analysis": ("a structured method for identifying the fundamental cause(s) of a problem rather than just treating its symptoms", "Common techniques: 5 Whys, fishbone (Ishikawa) diagram, fault tree analysis."),
    "etl pipeline": ("an automated workflow that extracts data from sources, transforms it to the required format, and loads it into a target system", "Includes scheduling, error handling, logging, and monitoring for reliability."),
    "data integration": ("the process of combining data from different sources into a unified view", "Methods include ETL, ELT, data virtualization, and data federation."),
    "data migration": ("the process of moving data from one system or format to another", "Requires careful planning, validation, and testing to ensure data completeness and accuracy."),
    "data modeling": ("the process of creating an abstract representation of data structures and their relationships", "Output is a data model (conceptual, logical, or physical) that guides database design."),
    "entity relationship diagram": ("a visual representation of data entities and the relationships between them", "Used in database design to map out tables, attributes, and foreign key relationships."),
    "erd": ("Entity Relationship Diagram — a visual model showing entities (tables), their attributes, and relationships", "Foundation for database design. Shows cardinality (one-to-one, one-to-many, many-to-many)."),
    "cardinality": ("the quantitative relationship between two tables (one-to-one, one-to-many, many-to-many)", "Defines how many instances of one entity relate to instances of another."),
    "data architecture": ("the set of rules, policies, standards, and models that govern how data is collected, stored, integrated, and used", "Encompasses data models, storage systems, integration patterns, and governance frameworks."),
    "sql": ("Structured Query Language — the standard language for managing and querying relational databases", "Core operations: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove), and DDL (define structure)."),
    "query": ("a request to retrieve or manipulate data in a database", "In SQL, a SELECT query specifies what data to retrieve and from where."),
    "data validation": ("the process of ensuring that data meets defined quality rules before it is used or stored", "Checks for completeness, format correctness, range validity, and referential integrity."),
    "business rule": ("a rule that defines or constrains some aspect of business and governs how data is processed or interpreted", "Examples: 'discount cannot exceed 50%', 'order date must precede ship date'."),
    "use case": ("a description of how a user or system interacts with another system to achieve a specific goal", "Defines the scope and requirements of a feature or process."),
    "stakeholder": ("any person or group with an interest in a project's outcomes", "In data projects: business users, IT, executives, regulators, and data consumers."),
    "requirements gathering": ("the process of collecting and documenting what stakeholders need from a system or analysis", "Critical first step in any project; poor requirements lead to delivering the wrong solution."),
    "proof of concept": ("a small-scale test to validate whether a proposed approach or technology is feasible", "Reduces risk by demonstrating viability before committing to full development."),
    "poc": ("Proof of Concept — a small prototype that tests whether an idea or technology will work as expected", "Not intended for production; its purpose is to validate technical feasibility."),

    # Specific CompTIA SecAI+ topics
    "data collection": ("the process of gathering raw data from various sources for analysis", "Methods: surveys, sensors, web scraping, APIs, manual entry, and automated data feeds."),
    "survey": ("a data collection method that gathers information from respondents through questions", "Provides primary data directly from the source. Can be structured (fixed questions) or unstructured (open-ended)."),
    "observation": ("a data collection method where data is gathered by watching subjects in their natural environment", "Minimizes the Hawthorne effect if subjects are unaware they are being observed."),
    "interview": ("a primary data collection method involving direct questioning of respondents", "Can be structured, semi-structured, or unstructured. Provides rich qualitative data."),
    "sampling": ("selecting a subset of a population to estimate characteristics of the whole", "Methods: random, stratified, cluster, systematic, and convenience sampling."),
    "random sampling": ("a sampling method where every member of the population has an equal chance of being selected", "Reduces bias and allows statistical inference about the population."),
    "stratified sampling": ("dividing a population into subgroups (strata) and sampling from each proportionally", "Ensures representation of all subgroups, especially minority groups."),
    "data source": ("any system, file, or location from which data is collected", "Can be internal (CRM, ERP, databases) or external (APIs, web, government data)."),
    "first party data": ("data collected directly by an organization from its own customers or users", "Most trusted and most relevant to the organization's specific context."),
    "second party data": ("data acquired directly from another organization that collected it from their audience", "More reliable than third-party data since its source is known."),
    "third party data": ("data collected by an external organization and sold or shared to others", "Broadest reach but least control over collection methods and quality."),
    "open data": ("data that is publicly available for anyone to access, use, and redistribute", "Examples: government data portals, census data, OpenStreetMap."),
    "data enrichment": ("enhancing existing data by adding relevant information from external sources", "Example: appending demographic data to customer records to improve segmentation."),
    "concatenation": ("the operation of joining two or more strings end-to-end to form a new string", "Example: combining first name and last name fields into a full name field."),
    "parsing": ("the process of analyzing and converting data from one format into a structured format", "Example: splitting a date string '2024-01-15' into year, month, and day fields."),
    "regular expression": ("a sequence of characters that defines a search pattern for matching strings", "Used for data validation, extraction, and transformation. Example: validating email formats."),
    "data transformation": ("converting data from one format, structure, or value set to another", "Includes type conversion, normalization, aggregation, and encoding."),
    "encoding": ("converting data into a specific format for storage or transmission", "Categorical encoding converts text categories into numbers for machine learning models."),
    "binning": ("dividing continuous data into discrete intervals or categories (bins)", "Example: converting age (continuous) into age groups (0-17, 18-34, 35-54, 55+)."),
    "pivot": ("transforming rows into columns (or vice versa) to change the structure of a dataset", "Useful for converting long-format data to wide-format for comparison across categories."),
    "unpivot": ("converting columns into rows, transforming wide-format data into a long format", "Useful when multiple columns represent the same attribute (e.g., sales by month)."),
    "data append": ("adding new rows (records) to an existing dataset", "Differs from joining, which adds new columns. Used when combining data from the same source over different time periods."),
    "data merge": ("combining two or more datasets based on a common key or identifier", "Equivalent to a SQL JOIN. Matches records from different datasets using a shared field."),
    "sorting": ("arranging data in ascending or descending order based on one or more columns", "Fundamental data operation for ranking, display, and identifying extremes."),
    "filtering": ("selecting a subset of data that meets specified criteria", "Example: selecting only customers from California, or transactions over $1,000."),
    "transposing": ("swapping the rows and columns of a dataset so rows become columns and vice versa", "Useful for reshaping data for different analysis or display requirements."),
    "recoding": ("changing the values of a variable to a new coding scheme", "Example: converting 'Yes'/'No' responses to 1/0 for analysis."),
    "data export": ("extracting data from a system and saving it in a format for use in another system", "Common formats: CSV, Excel, JSON, XML, Parquet."),
    "report distribution": ("the process of delivering reports to intended recipients through defined channels", "Methods: email, print, file share, BI portal, scheduled delivery."),
    "caching": ("storing frequently accessed data in fast-access memory to reduce retrieval time", "Improves application performance by avoiding repeated expensive computations or database queries."),
    "latency": ("the delay between a request and the corresponding response in a system", "High latency slows analysis and reporting. Reduced through caching, indexing, and infrastructure optimization."),
    "throughput": ("the amount of data processed or transmitted in a given time period", "A measure of system capacity. High-throughput systems can handle large volumes of data efficiently."),
    "batch processing": ("processing large volumes of data at scheduled intervals rather than in real time", "Used for nightly report generation, data warehouse loads, and large-scale transformations."),
    "real-time processing": ("processing and analyzing data as it is generated, with minimal delay", "Used for fraud detection, live dashboards, and IoT sensor monitoring."),
    "stream processing": ("continuous processing of data as it flows in, event by event", "Technologies: Apache Kafka, Apache Flink, AWS Kinesis. Used for real-time analytics."),
    "data lake house": ("a data architecture combining the flexibility of a data lake with the structure and performance of a data warehouse", "Supports both analytical and machine learning workloads on the same platform."),
    "data fabric": ("a data management architecture that connects distributed data sources into an integrated, accessible layer", "Uses metadata, AI, and automation to provide consistent data access across environments."),
    "data mesh": ("a decentralized data architecture where domain teams own and manage their own data products", "Treats data as a product with defined interfaces, quality standards, and ownership."),
}

# Phrase patterns for definition-style answers (regex → (what_it_is, context))
import re as _re
PHRASE_PATTERNS = [
    (_re.compile(r'square root of.{0,30}variance', _re.I), ("the standard deviation", "It measures how spread out data values are from the mean.")),
    (_re.compile(r'average.{0,30}squared.{0,30}differ', _re.I), ("the variance", "It quantifies total spread by averaging squared deviations from the mean.")),
    (_re.compile(r'middle value', _re.I), ("the median", "The middle value when data is sorted; the 50th percentile.")),
    (_re.compile(r'most (frequent|common) value', _re.I), ("the mode", "The value that appears most often in a dataset.")),
    (_re.compile(r'sum.{0,20}divid.{0,20}count|divid.{0,20}number of.{0,20}values', _re.I), ("the mean (average)", "The arithmetic average: sum all values then divide by how many there are.")),
    (_re.compile(r'extract.{0,30}transform.{0,30}load', _re.I), ("ETL (Extract, Transform, Load)", "The standard data integration pipeline for moving data into a warehouse.")),
    (_re.compile(r'personally identifiable', _re.I), ("PII (Personally Identifiable Information)", "Any data that can be used to identify a specific individual; protected by privacy laws.")),
    (_re.compile(r'null hypothesis', _re.I), ("the null hypothesis", "The assumption of no effect or no difference; rejected when p < alpha.")),
    (_re.compile(r'p.{0,5}value', _re.I), ("the p-value", "The probability of observing the data if the null hypothesis were true.")),
    (_re.compile(r'true positive rate|sensitivity', _re.I), ("recall (sensitivity / true positive rate)", "The proportion of actual positives the model correctly identifies.")),
    (_re.compile(r'no true zero', _re.I), ("interval data", "Has equal intervals but no absolute zero — differences are meaningful but ratios are not.")),
    (_re.compile(r'rows.{0,30}columns|column.{0,30}row', _re.I), ("tabular/structured data", "Data organized into rows and columns — the foundation of relational databases.")),
    (_re.compile(r'single.{0,20}authoritative|golden record', _re.I), ("Master Data Management (MDM)", "Creates one trusted source of truth for critical business data like customers and products.")),
    (_re.compile(r'measure of.{0,30}dispersion|spread.{0,20}data', _re.I), ("a measure of variability/spread", "Quantifies how much data values differ from each other or from the mean.")),
    (_re.compile(r'how.{0,20}spread|spread.{0,20}around.{0,20}mean', _re.I), ("the standard deviation", "Measures the average distance of data points from the mean.")),
    (_re.compile(r'predict.{0,30}future|future.{0,20}value', _re.I), ("forecasting/predictive analytics", "Uses historical data and statistical models to estimate future outcomes.")),
    (_re.compile(r'data.{0,20}without.{0,20}identif|remov.{0,20}identif', _re.I), ("data anonymization", "Irreversibly removes identifying information so individuals cannot be re-identified.")),
    (_re.compile(r'replac.{0,20}sensitiv.{0,20}data.{0,20}fictitious|fictitious.{0,20}data', _re.I), ("data masking", "Replaces real sensitive data with realistic but fictitious values for testing environments.")),
    (_re.compile(r'right.{0,20}(be forgotten|erasure)', _re.I), ("the right to erasure (GDPR)", "Under GDPR, individuals can request their personal data be deleted.")),
    (_re.compile(r'data.{0,20}describ.{0,20}other.{0,20}data|about.{0,20}the.{0,20}data', _re.I), ("metadata", "Data that describes other data — including format, author, size, and creation date.")),
]

def is_calc(opts):
    """Detect if this is a numeric-computation question (answers are numbers/formulas)."""
    numeric = 0
    for o in opts:
        text = o.get('text','')
        if _re.search(r'^\s*[\$£€]?\s*[\d,]+\.?\d*\s*(%|mm|cm|kg|lb|m|ft|mi|km|hrs?)?\s*$', text):
            numeric += 1
    return numeric >= 3

def calc_hint(q):
    """Return formula hints for computation questions."""
    txt = (q.get('q','') + ' '.join(o[1] for o in q.get('opts',[]) if len(o)>=2)).lower()
    if 'mean' in txt or 'average' in txt:
        return "Mean = Sum of all values ÷ Number of values"
    if 'median' in txt:
        return "Median = middle value when sorted (average of two middle values if even count)"
    if 'mode' in txt:
        return "Mode = the value that appears most frequently"
    if 'standard deviation' in txt or 'std dev' in txt:
        return "Standard Deviation = √(Variance) = √[Σ(xᵢ - mean)² / N]"
    if 'variance' in txt:
        return "Variance = Σ(xᵢ - mean)² / N"
    if 'range' in txt:
        return "Range = Maximum value − Minimum value"
    if 'percentile' in txt or 'quartile' in txt:
        return "Sort data; locate the position using (P/100) × N"
    if 'correlation' in txt:
        return "Correlation coefficient r ranges from −1 to +1; 0 means no linear relationship"
    if 'iqr' in txt or 'interquartile' in txt:
        return "IQR = Q3 − Q1 (the middle 50% of data)"
    if 'z-score' in txt or 'z score' in txt:
        return "Z-score = (value − mean) / standard deviation"
    if 'profit' in txt or 'margin' in txt:
        return "Profit Margin = (Revenue − Cost) / Revenue × 100%"
    if 'growth' in txt or 'rate of change' in txt:
        return "Growth Rate = (New − Old) / Old × 100%"
    return "Apply the relevant formula step-by-step, then verify units match the answer choices."

def lookup(text):
    """Look up a term in the KB. Returns (what_it_is, context) or None."""
    t = text.lower().strip()
    # Exact match
    if t in KB:
        return KB[t]
    # Partial key match (key is substring of answer text)
    for key, val in KB.items():
        if key in t:
            return val
    # Answer text is a substring of a key (e.g. "etl" answer, key "etl")
    for key, val in KB.items():
        if t in key and len(t) > 3:
            return val
    # Phrase pattern match
    for pat, val in PHRASE_PATTERNS:
        if pat.search(text):
            return val
    return None

def get_exp(q):
    """Build explanation HTML for a question."""
    # Data format: opts = [[letter, text], ...], ans = correct letter
    raw_opts = q.get('opts', [])
    opts = [{'letter': o[0], 'text': o[1]} for o in raw_opts if len(o) >= 2]
    ans_letter = q.get('ans', 'A')
    correct_idx = next((i for i, o in enumerate(opts) if o['letter'] == ans_letter), 0)
    correct_opt = opts[correct_idx] if correct_idx < len(opts) else {}
    correct_text = correct_opt.get('text', '')
    correct_letter = correct_opt.get('letter', ans_letter)
    question_text = q.get('q', '')
    domain = q.get('topic', '')

    # Detect calculation questions — pass raw text list
    if is_calc([{'text': o['text']} for o in opts]):
        hint = calc_hint(q)
        correct_html = (
            f"<strong>{correct_letter})</strong> <code>{correct_text}</code> is the correct calculated answer. "
            f"<br><em>Formula reminder:</em> {hint}"
        )
        wrong_parts = []
        for i, opt in enumerate(opts):
            if i == correct_idx:
                continue
            wrong_parts.append(f"<strong>{opt['letter']})</strong> <em>{opt['text']}</em> — incorrect calculation result.")
        wrong_html = ' '.join(wrong_parts) if wrong_parts else ''
        return {'correct': correct_html, 'wrong': wrong_html, 'domain': domain}

    # Knowledge-based question
    kb_result = lookup(correct_text)

    if kb_result:
        what_it_is, context = kb_result
        correct_html = (
            f"<strong>{correct_letter})</strong> <strong>{correct_text}</strong> is the correct answer. "
            f"<br><strong>What it is:</strong> {correct_text} is {what_it_is}. "
            f"<br><strong>Why correct here:</strong> {context}"
        )
    else:
        # Try matching from question stem
        kb_result2 = lookup(question_text)
        if kb_result2:
            what_it_is, context = kb_result2
            correct_html = (
                f"<strong>{correct_letter})</strong> <strong>{correct_text}</strong> is the correct answer. "
                f"<br><strong>Concept:</strong> {what_it_is}. "
                f"<br><strong>Why correct here:</strong> {context}"
            )
        else:
            correct_html = (
                f"<strong>{correct_letter})</strong> <strong>{correct_text}</strong> is the correct answer "
                f"for this question about <em>{domain}</em>."
            )

    # Build wrong-answer explanations
    wrong_parts = []
    for i, opt in enumerate(opts):
        if i == correct_idx:
            continue
        opt_text = opt.get('text', '')
        opt_letter = opt.get('letter', chr(65 + i))
        kb_wrong = lookup(opt_text)
        if kb_wrong:
            what_it_is_w, context_w = kb_wrong
            wrong_parts.append(
                f"<strong>{opt_letter})</strong> <em>{opt_text}</em> — "
                f"This is {what_it_is_w}. {context_w} It does not answer this question correctly."
            )
        else:
            wrong_parts.append(
                f"<strong>{opt_letter})</strong> <em>{opt_text}</em> — "
                f"This is not the best answer for this scenario."
            )

    wrong_html = '<br>'.join(wrong_parts)
    return {'correct': correct_html, 'wrong': wrong_html, 'domain': domain}

# ── Generate ─────────────────────────────────────────────────────────────────
matched = 0
total = len(data)
out = {}
for q in data:
    num = str(q.get('num', q.get('id', '')))
    exp = get_exp(q)
    out[num] = exp
    raw_opts2 = q.get('opts', [])
    opts2 = [{'letter': o[0], 'text': o[1]} for o in raw_opts2 if len(o) >= 2]
    ans_letter2 = q.get('ans', 'A')
    cidx2 = next((i for i, o in enumerate(opts2) if o['letter'] == ans_letter2), 0)
    correct_text2 = opts2[cidx2]['text'] if cidx2 < len(opts2) else ''
    if is_calc([{'text': o['text']} for o in opts2]) or lookup(correct_text2) or lookup(q.get('q','')):
        matched += 1

print(f"Matched {matched}/{total} questions ({matched*100//total}%)", file=sys.stderr)

js_out = 'const EXPLANATIONS = ' + json.dumps(out, ensure_ascii=False, indent=2) + ';\n'
with explanations_path.open('w', encoding='utf-8') as f:
    f.write('// Auto-generated explanations for CompTIA SecAI+ CY0-001 practice questions\n')
    f.write(js_out)
print(f"Done! Written to {explanations_path}", file=sys.stderr)
