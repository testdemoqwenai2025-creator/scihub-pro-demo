const messages = {
  // ============ NAVIGATION ============
  nav: {
    home: 'Home',
    dashboard: 'Dashboard',
    connectors: 'Connectors',
    workspace: 'Workspace',
    data: 'Data Lake',
    query: 'Query',
    knowledge: 'Knowledge Graph',
    compute: 'Compute',
    collaboration: 'Collaboration',
    aethel: 'AETHEL AI',
    settings: 'Settings',
    search: 'Search papers, data, sequences...',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
  },

  // ============ LANDING PAGE ============
  landing: {
    title: 'The Scientific GitHub for the Modern Age',
    subtitle: 'Unified open-source scientific computing platform for Bioinformatics, Cheminformatics, Molecular Modelling, Materials Science, Physics, and ML/Data Science',
    cta_primary: 'Enter Platform',
    cta_secondary: 'View Documentation',
    badge_open_source: 'Open Source',
    badge_community_free: 'Community Free',
    
    stats_microservices: '{count} Microservices',
    stats_languages: '{count} Languages',
    stats_uptime: '{uptime} Uptime',
    
    features_title: 'Powerful Features for Modern Research',
    features_subtitle: 'Everything you need for cutting-edge scientific computing in one unified platform',
    
    bioinformatics: 'Bioinformatics',
    bioinformatics_desc: 'Genomic analysis, sequence alignment, variant calling, and phylogenetics tools',
    
    cheminformatics: 'Cheminformatics',
    cheminformatics_desc: 'Molecular modeling, drug discovery, chemical databases, and QSAR analysis',
    
    molecular_modelling: 'Molecular Modelling',
    molecular_modelling_desc: 'Protein folding, docking simulations, and molecular dynamics',
    
    materials_science: 'Materials Science',
    materials_science_desc: 'Crystal structure prediction, properties simulation, and materials discovery',
    
    physics: 'Physics',
    physics_desc: 'Quantum simulations, particle physics, and computational methods',
    
    ml_data_science: 'ML / Data Science',
    ml_data_science_desc: 'Machine learning pipelines, statistical analysis, and visualization',

    architecture_title: 'Polyglot Architecture',
    architecture_subtitle: 'Each language chosen for its specific strengths in scientific computing',
    
    golang: 'Golang',
    golang_desc: 'API Gateway & High-performance services',
    
    elixir: 'Elixir',
    elixir_desc: 'Real-time systems via BEAM VM',
    
    python: 'Python',
    python_desc: 'ML/AI Engine (PyTorch, TensorFlow)',
    
    scala: 'Scala',
    scala_desc: 'Apache Spark streaming pipelines',
    
    rust: 'Rust',
    rust_desc: 'Query engine & performance-critical paths',
    
    c_lang: 'C',
    c_lang_desc: 'System calls & low-level optimizations',

    aethel_title: 'AETHEL AI Integration',
    aethel_desc: 'Advanced Experimental Theoretical Hypercomputing Emulation Layer for next-generation AI-assisted research',
    
    testimonials_title: 'Trusted by Researchers Worldwide',
    
    footer_tagline: 'Building the Future of Scientific Computing Together',
    footer_for_tomorrow: 'For Tomorrow\'s World',
  },

  // ============ DASHBOARD ============
  dashboard: {
    title: 'Dashboard',
    welcome_back: 'Welcome back, {name}',
    overview: 'Overview',
    recent_activity: 'Recent Activity',
    quick_actions: 'Quick Actions',
    system_status: 'System Status',
    active_jobs: 'Active Jobs',
    storage_used: 'Storage Used',
    api_calls_today: 'API Calls Today',
    collaborators: 'Collaborators',
    new_search: 'New Search',
    view_connectors: 'View Connectors',
    open_workspace: 'Open Workspace',
    run_workflow: 'Run Workflow',
  },

  // ============ CONNECTORS ============
  connectors: {
    title: 'Scientific Connectors Hub',
    subtitle: 'Connect to major free scientific data sources worldwide',
    search_sources: 'Search data sources...',
    all_sources: 'All Sources',
    biological: 'Biological Sciences',
    chemical: 'Chemical Sciences',
    literature: 'Academic Literature',
    repositories: 'Data Repositories',
    
    connected: 'Connected',
    available: 'Available',
    configuring: 'Configuring',
    error: 'Error',
    
    records: '{count} Records',
    last_sync: 'Last synced {time}',
    free_tier: 'Free Tier',
    auth_required: 'Auth Required',
    api_available: 'API Available',
    
    connect: 'Connect',
    disconnect: 'Disconnect',
    configure: 'Configure',
    query_data: 'Query Data',
    view_docs: 'View Documentation',
    
    status: 'Status',
    data_types: 'Data Types',
    update_freq: 'Update Frequency',
    features: 'Features',
  },

  // ============ WORKSPACE / IDE ============
  workspace: {
    title: 'Scientific Workspace',
    subtitle: 'Integrated development environment for scientific computing',
    
    code_editor: 'Code Editor',
    terminal: 'Terminal',
    notebooks: 'Notebooks',
    visualizations: 'Visualizations',
    
    new_file: 'New File',
    open_file: 'Open File',
    save: 'Save',
    run: 'Run',
    debug: 'Debug',
    share: 'Share',
    
    select_language: 'Select Language',
    python: 'Python',
    r_lang: 'R',
    julia: 'Julia',
    sql: 'SQL',
    bash: 'Bash',
    markdown: 'Markdown',
    
    output: 'Output',
    console: 'Console',
    problems: 'Problems',
    
    no_file_open: 'No file open. Create or open a file to start.',
    execution_complete: 'Execution completed in {time}s',
    execution_error: 'Execution error',
  },

  // ============ DATA LAKE ============
  data: {
    title: 'Data Lake',
    subtitle: 'Browse, upload, and manage your scientific datasets',
    
    my_datasets: 'My Datasets',
    public_datasets: 'Public Datasets',
    recent: 'Recent',
    favorites: 'Favorites',
    
    upload_dataset: 'Upload Dataset',
    create_collection: 'Create Collection',
    import_from_url: 'Import from URL',
    
    name: 'Name',
    size: 'Size',
    type: 'Type',
    modified: 'Modified',
    actions: 'Actions',
    
    rows: '{count} Rows',
    columns: '{count} Columns',
    file_size: '{size} MB',
    
    preview: 'Preview',
    download: 'Download',
    delete: 'Delete',
    share: 'Share',
    info: 'Info',
    
    no_datasets: 'No datasets found. Upload or import data to get started.',
  },

  // ============ QUERY EXECUTOR ============
  query: {
    title: 'Query Executor',
    subtitle: 'Execute queries across multiple data sources',
    
    sql_editor: 'SQL Editor',
    query_builder: 'Query Builder',
    saved_queries: 'Saved Queries',
    query_history: 'History',
    
    select_table: 'Select Table',
    write_query: 'Write your SQL query here...',
    execute: 'Execute (⌘+↵)',
    explain: 'Explain Plan',
    format: 'Format',
    clear: 'Clear',
    save_query: 'Save Query',
    
    results: 'Results',
    execution_plan: 'Execution Plan',
    statistics: 'Statistics',
    
    query_time: 'Query Time',
    rows_returned: 'Rows Returned',
    rows_affected: 'Rows Affected',
    
    no_results: 'No results to display. Execute a query to see results.',
    query_success: 'Query executed successfully',
    query_error: 'Query execution failed',
  },

  // ============ KNOWLEDGE GRAPH ============
  knowledge: {
    title: 'Knowledge Graph',
    subtitle: 'Explore relationships between concepts, papers, authors, and data',
    
    graph_view: 'Graph View',
    table_view: 'Table View',
    search_graph: 'Search the graph...',
    
    filter_by_type: 'Filter by Type',
    all_types: 'All Types',
    concepts: 'Concepts',
    papers: 'Papers',
    authors: 'Authors',
    datasets: 'Datasets',
    genes: 'Genes',
    compounds: 'Compounds',
    
    zoom_in: 'Zoom In',
    zoom_out: 'Zoom Out',
    reset_view: 'Reset View',
    export_image: 'Export Image',
    
    nodes: 'Nodes',
    edges: 'Edges',
    selected_node: 'Selected Node',
    
    connections: 'Connections',
    related_papers: 'Related Papers',
    citation_network: 'Citation Network',
  },

  // ============ COMPUTE ============
  compute: {
    title: 'Compute Execution Layer',
    subtitle: 'Manage jobs, monitor resources, and orchestrate workflows',
    
    jobs: 'Jobs',
    queues: 'Queues',
    nodes: 'Nodes',
    history: 'History',
    
    new_job: 'Submit New Job',
    cancel_job: 'Cancel Job',
    restart_job: 'Restart Job',
    view_logs: 'View Logs',
    
    status: 'Status',
    queued: 'Queued',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    
    priority: 'Priority',
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    urgent: 'Urgent',
    
    compute_hours: 'Compute Hours',
    progress: 'Progress',
    submitted: 'Submitted',
    started: 'Started',
    completed_at: 'Completed',
    
    gpu_required: 'GPU Required',
    gpus_allocated: 'GPUs Allocated',
    memory: 'Memory',
    cpu_cores: 'CPU Cores',
    
    no_jobs: 'No jobs found. Submit a job to get started.',
  },

  // ============ COLLABORATION ============
  collaboration: {
    title: 'Collaboration Hub',
    subtitle: 'Work together with researchers worldwide',
    
    team: 'Team',
    projects: 'Projects',
    discussions: 'Discussions',
    shared_resources: 'Shared Resources',
    
    invite_member: 'Invite Member',
    create_project: 'Create Project',
    start_discussion: 'Start Discussion',
    
    members: 'Members',
    online: 'Online',
    role: 'Role',
    
    admin: 'Admin',
    member: 'Member',
    guest: 'Guest',
    
    principal_investigator: 'Principal Investigator',
    postdoc: 'Postdoc',
    phd_student: 'PhD Student',
    research_scientist: 'Research Scientist',
    data_scientist: 'Data Scientist',
    software_engineer: 'Software Engineer',
    
    comments: 'Comments',
    add_comment: 'Add a comment...',
    reply: 'Reply',
    like: 'Like',
    pin: 'Pin',
    report: 'Report',
    
    no_projects: 'No projects yet. Create one to collaborate!',
  },

  // ============ AETHEL AI ============
  aethel: {
    title: 'AETHEL AI Platform',
    subtitle: 'Advanced Experimental Theoretical Hypercomputing Emulation Layer',
    
    connection_status: 'Connection Status',
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    
    latency: 'Latency',
    uptime: 'Uptime',
    version: 'Version',
    compute_units: 'Compute Units',
    queue_depth: 'Queue Depth',
    active_jobs: 'Active Jobs',
    
    models: 'AI Models',
    select_model: 'Select Model',
    
    submit_job: 'Submit Job',
    job_prompt: 'Describe your computational task...',
    priority: 'Priority',
    compute_budget: 'Compute Budget (hours)',
    
    quick_templates: 'Quick Templates',
    literature_review: 'Literature Review',
    hypothesis_generation: 'Hypothesis Generation',
    data_analysis: 'Data Analysis',
    method_suggestion: 'Method Suggestion',
    code_generation: 'Code Generation',
    
    results_history: 'Results History',
    compute_time: 'Compute Time',
    tokens_used: 'Tokens Used',
    
    no_results: 'No results yet. Submit a job to see AI-generated insights.',
  },

  // ============ SETTINGS ============
  settings: {
    title: 'Settings',
    subtitle: 'Manage your account and application preferences',
    
    profile: 'Profile',
    appearance: 'Appearance',
    language: 'Language',
    notifications: 'Notifications',
    privacy: 'Privacy',
    api_keys: 'API Keys',
    billing: 'Billing',
    
    display_name: 'Display Name',
    email: 'Email',
    institution: 'Institution',
    orcid: 'ORCID iD',
    bio: 'Bio',
    
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    
    font_size: 'Font Size',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    
    save_changes: 'Save Changes',
    discard_changes: 'Discard Changes',
    changes_saved: 'Changes saved successfully',
  },

  // ============ COMMON ============
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    copy: 'Copy',
    paste: 'Paste',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    refresh: 'Refresh',
    export: 'Export',
    import: 'Import',
    print: 'Print',
    help: 'Help',
    about: 'About',
    
    yes: 'Yes',
    no: 'No',
    maybe: 'Maybe',
    
    total: 'Total',
    showing: 'Showing',
    of: 'of',
    per_page: 'per page',
    page: 'Page',
    
    no_data: 'No data available',
    try_again: 'Try Again',
    learn_more: 'Learn More',
    
    required: 'Required',
    optional: 'Optional',
    recommended: 'Recommended',
    
    free: 'Free',
    premium: 'Premium',
    upgrade: 'Upgrade',
    
    version: 'Version',
    documentation: 'Documentation',
    support: 'Support',
    feedback: 'Feedback',
    
    powered_by: 'Powered by SciHub Pro',
    made_with_love: 'Made with ❤️ for Science',
  },
};

export default messages;
