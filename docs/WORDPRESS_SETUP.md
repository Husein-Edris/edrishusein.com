# WordPress Setup Instructions for About Page

## 1. Create Skills Custom Post Type

### Step 1: Add Skills CPT to functions.php
Add this code to your theme's `functions.php` file:

```php
// Register Skills Custom Post Type
function create_skills_cpt() {
    $labels = array(
        'name' => 'Skills',
        'singular_name' => 'Skill',
        'menu_name' => 'Skills',
        'add_new' => 'Add New Skill',
        'add_new_item' => 'Add New Skill',
        'edit_item' => 'Edit Skill',
        'new_item' => 'New Skill',
        'view_item' => 'View Skill',
        'search_items' => 'Search Skills',
        'not_found' => 'No skills found',
        'not_found_in_trash' => 'No skills found in trash'
    );

    $args = array(
        'labels' => $labels,
        'public' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'skill',
        'graphql_plural_name' => 'skills',
        'query_var' => true,
        'rewrite' => array('slug' => 'skills'),
        'capability_type' => 'post',
        'has_archive' => false,
        'hierarchical' => false,
        'menu_position' => 25,
        'menu_icon' => 'dashicons-star-filled',
        'supports' => array('title', 'editor', 'thumbnail'),
    );

    register_post_type('skill', $args);
}
add_action('init', 'create_skills_cpt');
```

### Step 2: Create ACF Fields for Skills
1. Go to **Custom Fields > Field Groups**
2. Click **Add New**
3. Set **Title**: "Skill Fields"
4. Add these fields:

**Field 1:**
- Field Label: `Short Description`
- Field Name: `short_description`
- Field Type: `Textarea`
- Rows: 3

**Location Rules:**
- Show this field group if **Post Type** is equal to **skill**

## 2. Create Hobbies Custom Post Type

### Step 1: Add Hobbies CPT to functions.php
Add this code to your theme's `functions.php` file:

```php
// Register Hobbies Custom Post Type
function create_hobbies_cpt() {
    $labels = array(
        'name' => 'Hobbies',
        'singular_name' => 'Hobby',
        'menu_name' => 'Hobbies',
        'add_new' => 'Add New Hobby',
        'add_new_item' => 'Add New Hobby',
        'edit_item' => 'Edit Hobby',
        'new_item' => 'New Hobby',
        'view_item' => 'View Hobby',
        'search_items' => 'Search Hobbies',
        'not_found' => 'No hobbies found',
        'not_found_in_trash' => 'No hobbies found in trash'
    );

    $args = array(
        'labels' => $labels,
        'public' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'hobby',
        'graphql_plural_name' => 'hobbies',
        'query_var' => true,
        'rewrite' => array('slug' => 'hobbies'),
        'capability_type' => 'post',
        'has_archive' => false,
        'hierarchical' => false,
        'menu_position' => 26,
        'menu_icon' => 'dashicons-heart',
        'supports' => array('title', 'editor', 'thumbnail'),
    );

    register_post_type('hobby', $args);
}
add_action('init', 'create_hobbies_cpt');
```

### Step 2: Create ACF Fields for Hobbies
1. Go to **Custom Fields > Field Groups**
2. Click **Add New**
3. Set **Title**: "Hobby Fields"
4. Add these fields:

**Field 1:**
- Field Label: `Description`
- Field Name: `description`
- Field Type: `Textarea`
- Rows: 4

**Location Rules:**
- Show this field group if **Post Type** is equal to **hobby**

## 3. Create About Page ACF Fields

### Step 1: Create About Page Field Group
1. Go to **Custom Fields > Field Groups**
2. Click **Add New**
3. Set **Title**: "About Page Fields"

### Step 2: Add Fields Structure

**Tab 1: Hero Section**
- Field Type: `Tab`
- Field Label: `Hero Section`

**Hero Title:**
- Field Label: `About Hero Title`
- Field Name: `about_hero_title`
- Field Type: `Text`

**Hero Subtitle:**
- Field Label: `About Hero Subtitle`
- Field Name: `about_hero_subtitle`
- Field Type: `Textarea`
- Rows: 2

**Hero Image:**
- Field Label: `About Hero Image`
- Field Name: `about_hero_image`
- Field Type: `Image`

**Tab 2: Experience Section**
- Field Type: `Tab`
- Field Label: `Experience Section`

**Experience Section Title:**
- Field Label: `Section Title`
- Field Name: `experience_section_title`
- Field Type: `Text`
- Default Value: `Experience`

**Experience Items:**
- Field Label: `Experience Items`
- Field Name: `experience_items`
- Field Type: `Repeater`
- Sub Fields:
  - **Company Name** (Text)
  - **Position** (Text)
  - **Duration** (Text)
  - **Description** (Textarea, 3 rows)
  - **Technologies** (Text)

**Tab 3: Skills Section**
- Field Type: `Tab`
- Field Label: `Skills Section`

**Skills Section Title:**
- Field Label: `Section Title`
- Field Name: `skills_section_title`
- Field Type: `Text`
- Default Value: `Skills & Technologies`

**Selected Skills:**
- Field Label: `Selected Skills`
- Field Name: `selected_skills`
- Field Type: `Post Object`
- Post Type: `skill`
- Allow Multiple: `Yes`
- Return Format: `Post Object`

**Tab 4: Personal Section**
- Field Type: `Tab`
- Field Label: `Personal Section`

**Personal Section Title:**
- Field Label: `Section Title`
- Field Name: `personal_section_title`
- Field Type: `Text`
- Default Value: `Personal`

**Personal Content:**
- Field Label: `Personal Content`
- Field Name: `personal_content`
- Field Type: `Wysiwyg Editor`

**Personal Image:**
- Field Label: `Personal Image`
- Field Name: `personal_image`
- Field Type: `Image`

**Selected Hobbies:**
- Field Label: `Selected Hobbies`
- Field Name: `selected_hobbies`
- Field Type: `Post Object`
- Post Type: `hobby`
- Allow Multiple: `Yes`
- Return Format: `Post Object`

### Step 3: Location Rules
Set **Location Rules**:
- Show this field group if **Page Template** is equal to **Default Template**
- AND **Page** is equal to **About** (select your about page)

## 4. Create Sample Content

### Skills:
1. Go to **Skills > Add New**
2. Create skills like:
   - **React** - "A JavaScript library for building user interfaces"
   - **Next.js** - "React framework for production-grade applications"
   - **TypeScript** - "JavaScript with syntax for types"
   - **WordPress** - "Content management system and headless CMS"

### Hobbies:
1. Go to **Hobbies > Add New**
2. Create hobbies like:
   - **Reading** - "Enjoying books on technology, philosophy, and fiction"
   - **Photography** - "Capturing moments and exploring creative composition"
   - **Gaming** - "Playing strategy and adventure games"

### About Page:
1. Go to **Pages > About**
2. Fill in the ACF fields with your information
3. Select your skills and hobbies from the dropdowns

## 5. Refresh Permalinks
After adding the CPTs:
1. Go to **Settings > Permalinks**
2. Click **Save Changes** (this refreshes the rewrite rules)

## Done!
Your WordPress setup is now complete. The Next.js application will automatically fetch and display this content.