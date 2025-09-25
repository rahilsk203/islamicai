# Quranic Verse Integration Guide for IslamicAI

## Overview
This guide explains when and how the IslamicAI system should include Quranic verses (ayat) in chat responses to provide authentic Islamic guidance.

## When to Include Quranic Verses

### 🔴 HIGH PRIORITY (Always Include)

#### 1. Direct Quranic Questions
- Questions about specific Surahs or Ayahs
- Requests for Quranic meanings, context, or interpretation
- "What does this verse mean?" type questions

**Example Queries:**
- "What is the meaning of Surah Al-Fatiha?"
- "Explain Ayat al-Kursi"
- "What does the Quran say about patience?"

#### 2. Islamic Guidance Queries
- Halal/Haram matters
- Prayer, fasting, zakat, and religious obligations
- Moral and ethical guidance
- Life decisions requiring Islamic perspective

**Example Queries:**
- "Is this food halal?"
- "How should I pray?"
- "What is the Islamic view on interest?"
- "How to deal with difficult situations Islamically?"

#### 3. Islamic Law (Fiqh) Questions
- Legal rulings and jurisprudence
- Marriage, divorce, inheritance
- Business and trade matters
- Criminal and civil law

**Example Queries:**
- "What are the conditions for a valid marriage?"
- "How to calculate zakat?"
- "Islamic rules for business transactions"

### 🟡 MEDIUM PRIORITY (Usually Include)

#### 1. Spiritual and Moral Topics
- Faith, belief, and spirituality
- Character development and virtues
- Patience, gratitude, trust, hope
- Love, mercy, forgiveness

**Example Queries:**
- "How to strengthen my faith?"
- "What does Islam say about patience?"
- "How to develop good character?"

#### 2. Debate and Discussion
- Responding to skeptical questions
- Proving Islamic concepts
- Addressing misconceptions
- Interfaith dialogue

**Example Queries:**
- "Prove that God exists"
- "Why do Muslims pray 5 times?"
- "What is the Islamic view on women's rights?"

#### 3. Life Guidance
- Personal problems and solutions
- Decision-making guidance
- Wisdom and advice
- Coping with difficulties

**Example Queries:**
- "How to deal with stress?"
- "What should I do in this situation?"
- "Islamic advice for difficult times"

### 🟢 LOW PRIORITY (Include When Relevant)

#### 1. General Islamic Topics
- Basic Islamic concepts
- Islamic history and culture
- Muslim community topics
- General religious discussions

**Example Queries:**
- "What is Islam?"
- "Tell me about Islamic history"
- "What is the Muslim community like?"

## How to Format Quranic Verses

### Standard Format
```
**Arabic Text:**
وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا

**Transliteration:**
Wa man yattaqillāha yaj'al lahu makhrajan

**Translation:**
"And whoever fears Allah - He will make for him a way out"

**Reference:** Surah At-Talaq 65:2
```

### Context and Application
After providing the verse, always include:
- **Context:** When and why the verse was revealed
- **Application:** How it applies to the user's question
- **Practical Guidance:** What the user should do based on this verse

## Response Structure with Quranic Verses

### 1. Core Answer
Direct response to the user's question

### 2. Quranic Evidence
- Relevant verses with proper formatting
- Multiple verses if needed for comprehensive coverage
- Clear citations with Surah and verse numbers

### 3. Practical Application
- How to apply the Quranic guidance in daily life
- Specific steps or actions the user can take
- Real-world examples and scenarios

### 4. Additional Context
- Related Hadith if relevant
- Scholarly opinions if applicable
- Historical context when helpful

### 5. Conclusion
- Summary of key points
- Encouragement and motivation
- "Allah knows best" in appropriate language

## Technical Implementation

### Query Classification
The system automatically classifies queries and determines Quranic verse inclusion based on:

```javascript
const quranicVerseDecision = this.islamicPrompt.shouldIncludeQuranicVerses(userInput, queryType);
```

### Priority Levels
- **High:** Direct Quran, Islamic guidance, Fiqh
- **Medium:** Spiritual topics, debates, life guidance
- **Low:** General Islamic topics
- **None:** Non-Islamic queries

### Verse Types
- **Command verses:** Direct instructions from Allah
- **Guidance verses:** General guidance and wisdom
- **Prohibition verses:** Things to avoid
- **Evidence verses:** Proofs and arguments
- **Comfort verses:** Encouragement and hope
- **Wisdom verses:** Deep insights and lessons

## Examples of Proper Integration

### Example 1: Prayer Question
**User:** "How should I pray?"

**Response Structure:**
1. **Core Answer:** Explanation of prayer requirements
2. **Quranic Evidence:** 
   - Surah Al-Baqarah 2:3 (establishing prayer)
   - Surah Al-Isra 17:78 (prayer times)
3. **Practical Application:** Step-by-step prayer guide
4. **Additional Context:** Hadith about prayer importance
5. **Conclusion:** Encouragement to maintain prayer

### Example 2: Patience Question
**User:** "How to be patient during difficult times?"

**Response Structure:**
1. **Core Answer:** Islamic perspective on patience
2. **Quranic Evidence:**
   - Surah Al-Baqarah 2:153 (patience and prayer)
   - Surah At-Talaq 65:2 (Allah provides way out)
3. **Practical Application:** Daily practices for developing patience
4. **Additional Context:** Examples from Prophet's life
5. **Conclusion:** Reminder of Allah's mercy and wisdom

## Quality Standards

### Accuracy
- Only use authentic Quranic verses
- Verify Surah names and verse numbers
- Ensure translations are accurate and widely accepted

### Relevance
- Verses must directly relate to the question
- Avoid generic verses that don't add value
- Choose verses that provide specific guidance

### Completeness
- Include enough verses to fully address the topic
- Don't rely on single verses for complex topics
- Provide comprehensive coverage when needed

### Clarity
- Use clear, accessible language
- Explain difficult concepts
- Provide context for better understanding

## Common Mistakes to Avoid

1. **Including irrelevant verses** - Only use verses that directly relate to the question
2. **Poor formatting** - Always use the standard format for consistency
3. **Missing context** - Always explain how the verse applies to the situation
4. **Incomplete citations** - Always include Surah name and verse number
5. **Overwhelming with verses** - Use appropriate number of verses, not too many
6. **Ignoring practical application** - Always show how to apply the guidance

## Conclusion

The integration of Quranic verses in IslamicAI responses is essential for providing authentic Islamic guidance. By following these guidelines, the system ensures that users receive responses that are:

- **Authentic:** Based on Quranic sources
- **Comprehensive:** Covering all aspects of the topic
- **Practical:** Providing actionable guidance
- **Inspiring:** Motivating users to follow Islamic teachings

The system automatically determines when to include Quranic verses based on query analysis, ensuring consistent and appropriate integration across all responses.
