import os
import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
from sklearn.metrics import classification_report
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import StratifiedKFold

csv_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "outputs",
    "hrv_features.csv"
)

df = pd.read_csv(csv_path)

print(df.columns.tolist())

#print(df.info())

X = df.drop(columns=["subject", "condition"])
y = df["condition"]
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = RandomForestClassifier(random_state=42)
cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)
cv_scores = cross_val_score(
    model,
    X,
    y,
    cv=cv,
    scoring="accuracy"
)

print("\n5-Fold Cross Validation Scores:")
print(cv_scores)

print(f"\nAverage Cross Validation Accuracy: {cv_scores.mean():.2%}")
print(f"Standard Deviation: {cv_scores.std():.2%}")

model.fit(X_train, y_train)
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("Accuracy:", accuracy)

cm = confusion_matrix(y_test, y_pred)

print("Confusion Matrix:")
print(cm)

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

#print("Actual Labels   :", y_test)
#print("Predicted Labels:", y_pred)

#print("Training Features:", X_train.shape)
#print("Testing Features :", X_test.shape)

#print("Training Labels  :", y_train.shape)
#print("Testing Labels   :", y_test.shape)

#print("Encoded Labels:")
#print(y)

#print("Features (X):")
#print(X.head())

#print("\nTarget (y):")
#print("Target (y):")
#print(y[:5])
#print(label_encoder.classes_)
model_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "random_forest.pkl"
)

joblib.dump(model, model_path)

print(f"\nModel saved successfully!")
print(f"Location: {model_path}")